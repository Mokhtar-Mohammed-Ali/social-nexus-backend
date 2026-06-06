"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepository = void 0;
class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async insertMany({ data, }) {
        return (await this.model.insertMany(data));
    }
    async createOne({ data, options, }) {
        const [doc] = (await this.create({ data: [data], options })) || [];
        return doc;
    }
    async find({ filter, projection, options, }) {
        const doc = this.model.find(filter, projection);
        if (options?.lean)
            doc.lean(options.lean);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.skip)
            doc.skip(options.skip);
        if (options?.limit)
            doc.limit(options.limit);
        return await doc.exec();
    }
    async paginate({ filter, projection, options = {}, page, size }) {
        let count = -1;
        if (Number(page) > 0) {
            const p = parseInt(page);
            const s = parseInt(size);
            options.skip = (p - 1) * s;
            options.limit = s;
            count = await this.model.countDocuments(filter || {});
        }
        const docs = await this.find({ filter, projection, options });
        return {
            docs,
            ...(Number(page) > 0 ? {
                currentPage: Number(page),
                pages: Math.ceil(count / parseInt(size)),
                size,
            } : {})
        };
    }
    async findOne({ filter, projection, options, }) {
        const doc = this.model.findOne(filter, projection);
        if (options) {
            doc.setOptions(options);
        }
        return await doc.exec();
    }
    async findById({ _id, projection, options, }) {
        const doc = this.model.findById(_id, projection);
        if (options?.lean)
            doc.lean(options.lean);
        if (options?.populate)
            doc.populate(options.populate);
        return await doc.exec();
    }
    async updateOne({ filter, update, options, }) {
        return this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options = { new: true }, populate = [] }) {
        if (Array.isArray(update)) {
            const pipeline = [
                ...update,
                { $set: { __v: { $add: [{ $ifNull: ["$__v", 0] }, 1] } } }
            ];
            return await this.model.findOneAndUpdate(filter, pipeline, { ...options, updatePipeline: true });
        }
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options).populate(populate);
    }
    async findOneByIdAndUpdate({ _id, update, options = { new: true }, }) {
        return await this.model.findOneAndUpdate(_id, { ...update, $inc: { __v: 1 } }, options);
    }
    async updateMany({ filter, update, options, }) {
        return this.model.updateMany(filter, update, options);
    }
    async deleteOne({ filter, }) {
        return this.model.deleteOne(filter);
    }
    async findOneAndDelete({ filter, }) {
        return await this.model.findOneAndDelete(filter);
    }
    async findByIdAndDelete({ _id, }) {
        return await this.model.findByIdAndDelete(_id);
    }
    async deleteMany({ filter, }) {
        return this.model.deleteMany(filter);
    }
    async softDeleteById({ _id }) {
        return await this.model.findOneAndUpdate({ _id }, {
            deletedAt: new Date(),
            $unset: { restoredAt: 1 },
        }, { new: true });
    }
    async restoreById({ _id }) {
        return await this.model.findOneAndUpdate({ _id }, {
            restoredAt: new Date(),
            $unset: { deletedAt: 1 },
        }, { new: true });
    }
    async getReactionCounts(id) {
        return await this.model.aggregate([
            { $match: { _id: id } },
            { $unwind: "$reactions" },
            {
                $group: {
                    _id: "$reactions.type",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    count: 1
                }
            }
        ]);
    }
}
exports.DataBaseRepository = DataBaseRepository;
