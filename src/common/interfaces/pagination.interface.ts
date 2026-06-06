import { HydratedDocument } from "mongoose";

export interface IPagination<TRawDoc> {
  docs: HydratedDocument<TRawDoc>[],
  currentPage?: number | undefined,
  pages?: number | undefined,
  size?: number | string|undefined,
}