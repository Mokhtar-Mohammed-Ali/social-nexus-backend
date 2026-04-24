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
    async createOne({ data, options, }) {
        const [doc] = (await this.create({ data: [data], options })) || [];
        return doc;
    }
    async findOne({ filter, projection, options, }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.lean)
            doc.lean(options.lean);
        if (options?.populate)
            doc.populate(options.populate);
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
        return this.model.updateOne(filter, update, options);
    }
    async findOneAndUpdate({ filter, update, options = { new: true }, }) {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async findOneByIdAndUpdate({ _id, update, options = { new: true }, }) {
        return await this.model.findOneAndUpdate(_id, update, options);
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
}
exports.DataBaseRepository = DataBaseRepository;
