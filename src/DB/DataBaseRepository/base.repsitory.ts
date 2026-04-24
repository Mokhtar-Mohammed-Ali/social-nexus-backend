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
import { IUser } from "../../common/interfaces";
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

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc>;
    options?: (QueryOptions<TRawDoc> & { lean: true }) | null | undefined;
  }): Promise<HydratedDocument<IUser> | null>;

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc>;
    options?: (QueryOptions<TRawDoc> & { lean: false }) | null | undefined;
  }): Promise<null | FlattenMaps<IUser>>;

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
    if (options?.lean) doc.lean(options.lean);
    if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
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
  }): Promise<HydratedDocument<IUser> | null>;

  async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc>;
    options?: (QueryOptions<TRawDoc> & { lean: false }) | null | undefined;
  }): Promise<null | FlattenMaps<IUser>>;

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
    return this.model.updateOne(filter, update, options);
  }

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: {
    filter: QueryFilter<TRawDoc>;
    update: UpdateQuery<TRawDoc>;
    options: QueryOptions<TRawDoc> & ReturnsNewDoc;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return await this.model.findOneAndUpdate(filter, update, options);
  }

   async findOneByIdAndUpdate({
    _id,
    update,
    options = { new: true },
  }: {
    _id: Types.ObjectId;
    update: UpdateQuery<TRawDoc>;
    options: QueryOptions<TRawDoc> & ReturnsNewDoc;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return await this.model.findOneAndUpdate(_id, update, options);
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
}
