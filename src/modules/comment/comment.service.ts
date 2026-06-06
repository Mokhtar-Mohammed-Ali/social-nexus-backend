import { HydratedDocument, Types } from "mongoose";
import { CommentRepository } from "../../DB/DataBaseRepository/comment.repository";
import { BadRequestExpetions, NotFoundExpetions } from "../../common/exptions";
import { randomUUID } from "node:crypto";
import { toObjectId } from "../../common/utils/objectId";
import { IUser } from "../../common/interfaces";
import { IComment } from "../../common/interfaces/comment.interface";
import { S3Service } from "../../common/services";
import { CreateCommentBodyDTO, CreateCommentParamsDTO } from "./comment.DTO";

export class CommentService {
  private readonly commentRepository: CommentRepository;
  private readonly s3: S3Service;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.s3 = new S3Service();
  }

  async createComment(
    params: CreateCommentParamsDTO,
    body: CreateCommentBodyDTO,
    files: Express.Multer.File[],
    user: HydratedDocument<IUser>,
  ): Promise<IComment> {
    const { postId } = params;
    const { content, tags, commentId } = body;

    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files: files,
        path: `comments/${randomUUID()}`,
      });
    }

    const commentData: Partial<IComment> = {
      createdBy: user._id,
      postId: toObjectId(postId),
      content: content,
      attachments,
      tags: tags ? tags.map((t: string) => toObjectId(t)) : [],
    };

    if (commentId) {
      commentData.commentId = toObjectId(commentId);
    }

    const comment = await this.commentRepository.createOne({
      data: commentData as any,
    });

    if (!comment) throw new BadRequestExpetions("Fail to create comment");
    return comment;
  }

  async updateComment(
    commentId: string,
    userId: Types.ObjectId,
    body: { content?: string; removeFiles?: string[] },
    files:
      | Express.Multer.File[]
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined,
  ): Promise<IComment> {
    const comment = await this.commentRepository.findOne({
      filter: { _id: toObjectId(commentId), createdBy: userId },
    });
    if (!comment) throw new NotFoundExpetions("Comment not found");

    const filesToRemove = body.removeFiles || [];
    let newAttachments: string[] = [];

    if (files && Array.isArray(files) && files.length > 0) {
      newAttachments = await this.s3.uploadAssets({
        files: files as Express.Multer.File[],
        path: `comments/${randomUUID()}`,
      });
    }

    const updatedComment = await this.commentRepository.findOneAndUpdate({
      filter: { _id: toObjectId(commentId), createdBy: userId },
      update: [
        {
          $set: {
            content: body.content || comment.content,
            attachments: {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ["$attachments", []] },
                    as: "item",
                    cond: { $not: { $in: ["$$item", filesToRemove] } },
                  },
                },
                newAttachments,
              ],
            },
          },
        },
      ],
    });

    if (filesToRemove.length > 0) {
      await this.s3.deleteAssets({
        Keys: filesToRemove.map((key) => ({ Key: key })),
      });
    }

    if (!updatedComment)
      throw new BadRequestExpetions("Failed to update comment");
    return updatedComment as IComment;
  }

  async reactOnComment(
    commentId: string,
    userId: Types.ObjectId,
    reaction: number,
  ): Promise<IComment> {
    await this.commentRepository.updateOne({
      filter: { _id: toObjectId(commentId) as any },
      update: { $pull: { reactions: { user: userId } } as any },
    });

    const update =
      reaction >= 0
        ? { $push: { reactions: { user: userId, type: reaction } } }
        : {};
    const comment = await this.commentRepository.findOneAndUpdate({
      filter: { _id: toObjectId(commentId) as any },
      update: update as any,
    });

    if (!comment) throw new NotFoundExpetions("Comment not found");
    return comment as IComment;
  }

  async deleteComment(
    commentId: string,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    const deleted = await this.commentRepository.deleteOne({
      filter: { _id: toObjectId(commentId) as any, createdBy: userId },
    });
    return deleted.deletedCount === 1;
  }

  async getCommentsByPost(postId: string): Promise<IComment[]> {
    return await this.commentRepository.find({
      filter: { postId: toObjectId(postId), commentId: null } as any,
      options: {
        populate: [
          { path: "createdBy", select: "name profilePic" },
          {
            path: "replies",
            populate: { path: "createdBy", select: "name profilePic" },
          },
        ],
      },
    });
  }
}

export const commentService = new CommentService();
