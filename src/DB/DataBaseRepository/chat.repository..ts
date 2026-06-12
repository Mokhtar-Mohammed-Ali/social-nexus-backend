import {
  FlattenMaps,
  HydratedDocument,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
} from "mongoose";
import { IChat } from "../../common/interfaces/chat.interface";
import { ChatModel } from "../models";
import { DataBaseRepository } from "./base.repsitory";

export class ChatRepository extends DataBaseRepository<IChat> {
  constructor() {
    super(ChatModel);
  }
  async findOneChat({
    filter,
    projection,
    options,
    page,
    size,
  }: {
    filter?: QueryFilter<IChat>;
    projection?: ProjectionType<IChat> | null | undefined;
    options?: (QueryOptions<IChat> & { lean?: false }) | null | undefined;
    page?: string | undefined;
    size?: string | undefined;
  }): Promise<HydratedDocument<IChat> | null>;

  async findOneChat({
    filter,
    projection,
    options,
    page,
    size,
  }: {
    filter?: QueryFilter<IChat>;
    projection?: ProjectionType<IChat> | null | undefined;
    options?: (QueryOptions<IChat> & { lean?: true }) | null | undefined;
    page?: string | undefined;
    size?: string | undefined;
  }): Promise<FlattenMaps<IChat> | null>;
  async findOneChat({
    filter,
    projection,
    options,
    page = "1",
    size = "5",
  }: {
    filter?: QueryFilter<IChat>;
    projection?: ProjectionType<IChat> | null | undefined;
    options?: QueryOptions<IChat> | null | undefined;
    page?: string | number | undefined;
    size?: string | number | undefined;
  }): Promise<HydratedDocument<IChat> | FlattenMaps<IChat> | null> {
    page = parseInt(page as string);
    size = parseInt(size as string);
    const doc = this.model.findOne(filter, {
      messages: { $slice: [-(page * size), size] },
    });

    if (options?.populate) doc.populate(options.populate as PopulateOptions[]);

    if (options?.lean) doc.lean(options.lean);

    return await doc.exec();
  }
}
