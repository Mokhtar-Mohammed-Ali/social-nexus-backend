import { IComment } from "../../common/interfaces/comment.interface";
import { CommentModel } from "../models";
import { DataBaseRepository } from "./base.repsitory";

export class CommentRepository extends DataBaseRepository<IComment> {
  constructor() {
    super(CommentModel);
  }
}