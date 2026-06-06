import {
  _QueryFilter,
  DeleteResult,
  FlattenMaps,
  PopulateOptions,
  QueryFilter,
  ReturnsNewDoc,
  Types,
  UpdateQuery,
  UpdateResult,
  UpdateWithAggregationPipeline,
} from "mongoose";
import { QueryOptions } from "mongoose";
import {
  AnyKeys,
  CreateOptions,
  HydratedDocument,
  Model,
  ProjectionType,
} from "mongoose";
import { IPagination } from "../../common/interfaces";
import { UpdateOptions } from "mongodb";

export abstract class DataBaseRepository<TRawDoc> {
  constructor(protected readonly model: Model<TRawDoc>) {}

  async create({
    data,
  }: {
    data: AnyKeys<TRawDoc>;
  }): Promise<HydratedDocument<TRawDoc>>;
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRawDoc>[];
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDoc>[]>;

  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRawDoc>[] | AnyKeys<TRawDoc>;
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDoc>[] | HydratedDocument<TRawDoc>> {
    return await this.model.create(data as any, options);
  }
  // insertMany
  async insertMany({
    data,
  }: {
    data: AnyKeys<TRawDoc>[];
  }): Promise<HydratedDocument<TRawDoc>[]> {
    return (await this.model.insertMany(
      data as any,
    )) as HydratedDocument<TRawDoc>[];
  }

  async createOne({
    data,
    options,
  }: {
    data: AnyKeys<TRawDoc>;
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDoc>> {
    const [doc] = (await this.create({ data: [data], options })) || [];
    return doc as HydratedDocument<TRawDoc>;
  }

  // finders

  async find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc> | undefined;
  projection?: ProjectionType<TRawDoc> | undefined;
  options?: QueryOptions<TRawDoc> | null | undefined;
  }): Promise<HydratedDocument<TRawDoc>[]> {
    const doc = this.model.find(filter, projection);
    if (options?.lean) doc.lean(options.lean);
    if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if (options?.skip) doc.skip(options.skip);
        if (options?.limit) doc.limit(options.limit);
    return await doc.exec();
  }

  //find by pagination
async paginate({
  filter,
  projection,
  options = {}, 
  page,
  size
}: {
  filter?: QueryFilter<TRawDoc> | undefined;
  projection?: ProjectionType<TRawDoc> | undefined;
  options?: QueryOptions<TRawDoc> | undefined;
  page?: number | string | undefined;
  size?: number | string | undefined;
}): Promise<IPagination<TRawDoc>> {
  let count: number = -1;

  if (Number(page) > 0) {
    const p = parseInt(page as string);
    const s = parseInt(size as string);

    // تحديث الـ options بخصائص الـ pagination
    options.skip = (p - 1) * s;
    options.limit = s;

    count = await this.model.countDocuments(filter || {});
  }

  const docs = await this.find({ filter, projection, options });

  return {
    docs,
    ...(Number(page) > 0 ? {
      currentPage: Number(page),
      pages: Math.ceil(count / parseInt(size as string)),
      size,
    } : {})
  };
}



  // async findOne({
  //   filter,
  //   projection,
  //   options,
  // }: {
  //   filter?: QueryFilter<TRawDoc>;
  //   projection?: ProjectionType<TRawDoc>;
  //   options: (QueryOptions<TRawDoc> & { lean: true }) | null | undefined;
  // }): Promise<HydratedDocument<TRawDoc> | null>;

  // async findOne({
  //   filter,
  //   projection,
  //   options,
  // }: {
  //   filter?: QueryFilter<TRawDoc>;
  //   projection?: ProjectionType<TRawDoc>;
  //   options?: (QueryOptions<TRawDoc> & { lean: false }) | null | undefined;
  // }): Promise<null | FlattenMaps<TRawDoc>>;

  // async findOne({
  //   filter,
  //   projection,
  //   options,
  // }: {
  //   filter?: QueryFilter<TRawDoc>;
  //   projection?: ProjectionType<TRawDoc>;
  //   options?: QueryOptions<TRawDoc> | null | undefined;
  // }): Promise<any> {
  //   const doc = this.model.findOne(filter, projection);
  //   if (options?.lean) doc.lean(options.lean);
  //   if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
  //   return await doc.exec();
  // }






// 1. حالة الـ Lean: true (يرجع HydratedDocument إذا لم نستخدم lean حقيقي، لكن الـ Lean يرجع عادة plain object)
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc>;
    options: (QueryOptions<TRawDoc> & { lean: true | { virtuals?: boolean } }) | null | undefined;
  }): Promise<HydratedDocument<TRawDoc> | null>;

  // 2. حالة الـ Lean: false أو غير محدد (يرجع HydratedDocument)
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc>;
    options?: (QueryOptions<TRawDoc> & { lean?: false | null }) | null | undefined;
  }): Promise<HydratedDocument<TRawDoc> | null>;

  // 3. التنفيذ الفعلي
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc>;
    options?: QueryOptions<TRawDoc> | null | undefined;
  }): Promise<any> {
    const doc = this.model.findOne(filter, projection);
    
    // استخدام setOptions يطبق الـ lean والـ populate وكل شيء دفعة واحدة بأمان
    if (options) {
      doc.setOptions(options);
    }
    
    return await doc.exec();
  }




  //find by id

  async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc>;
    options?: (QueryOptions<TRawDoc> & { lean: true }) | null | undefined;
  }): Promise<HydratedDocument<TRawDoc> | null>;

  async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc>;
    options?: (QueryOptions<TRawDoc> & { lean: false }) | null | undefined;
  }): Promise<null | FlattenMaps<TRawDoc>>;

  async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc>;
    options?: QueryOptions<TRawDoc> | null | undefined;
  }): Promise<any> {
    const doc = this.model.findById(_id, projection);
    if (options?.lean) doc.lean(options.lean);
    if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
    return await doc.exec();
  }

  //update

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDoc>;
    update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline;
    options?: UpdateOptions | null;
  }): Promise<UpdateResult> {
    return this.model.updateOne(filter, {...update,$inc:{__v:1}}, options);
  }

  // async findOneAndUpdate({
  //   filter,
  //   update,
  //   options = { new: true },
  // }: {
  //   filter: QueryFilter<TRawDoc>;
  //   update: UpdateQuery<TRawDoc>;
  //   options?: QueryOptions<TRawDoc> & ReturnsNewDoc;
  // }): Promise<HydratedDocument<TRawDoc> | null| undefined> {
  //   if (Array.isArray(update)) {
  //   return await this.model.findOneAndUpdate(filter, {...update,$inc:{__v:1}},{...options,updatePipeline:true});
  // }
  //   return await this.model.findOneAndUpdate(filter, {...update,$inc:{__v:1}}, options);
  // }



async findOneAndUpdate({
  filter,
  update,
  options = { new: true },
  populate=[]
}: {
  filter: QueryFilter<TRawDoc>;
  update: UpdateQuery<TRawDoc> | any[]; // السماح بمصفوفة للـ Pipeline
  options?: QueryOptions<TRawDoc> & ReturnsNewDoc;
  populate?:PopulateOptions[];
}): Promise<HydratedDocument<TRawDoc> | null | undefined> {
  
  if (Array.isArray(update)) {
    const pipeline = [
      ...update,
      { $set: { __v: { $add: [{ $ifNull: ["$__v", 0] }, 1] } } }
    ];
    
    return await this.model.findOneAndUpdate(
      filter, 
      pipeline, 
      { ...options, updatePipeline: true }
    );
  }

  return await this.model.findOneAndUpdate(
    filter, 
    { ...update, $inc: { __v: 1 } }, 
    options
  ).populate(populate);
}



  async findOneByIdAndUpdate({
    _id,
    update,
    options = { new: true },
  }: {
    _id: Types.ObjectId;
    update: UpdateQuery<TRawDoc>;
    options?: QueryOptions<TRawDoc> & ReturnsNewDoc;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return await this.model.findOneAndUpdate(_id, {...update,$inc:{__v:1}}, options);
  }

  async updateMany({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDoc>;
    update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline;
    options?: UpdateOptions | null;
  }): Promise<UpdateResult> {
    return this.model.updateMany(filter, update, options);
  }

  // delete
  async deleteOne({
    filter,
  }: {
    filter: QueryFilter<TRawDoc>;
  }): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async findOneAndDelete({
    filter,
  }: {
    filter: QueryFilter<TRawDoc>;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return await this.model.findOneAndDelete(filter);
  }

  async findByIdAndDelete({
    _id,
  }: {
    _id: Types.ObjectId;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return await this.model.findByIdAndDelete(_id);
  }
  // delete many

  async deleteMany({
    filter,
  }: {
    filter: QueryFilter<TRawDoc>;
  }): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }

  // soft delete and restore
async softDeleteById({ _id }: { _id: Types.ObjectId }) {
  return await this.model.findOneAndUpdate(
    { _id },
    {
      deletedAt: new Date(),
      $unset: { restoredAt: 1 },
    },
    { new: true }
  );
}

async restoreById({ _id }: { _id: Types.ObjectId }) {
  return await this.model.findOneAndUpdate(
    { _id },
    {
      restoredAt: new Date(),
      $unset: { deletedAt: 1 },
    },
    { new: true }
  );
}

// count of reacts for post or comment
// داخل الـ DataBaseRepository
async getReactionCounts(id: Types.ObjectId) {
  return await (this.model as any).aggregate([
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
