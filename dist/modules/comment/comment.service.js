"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const comment_repository_1 = require("../../DB/DataBaseRepository/comment.repository");
const exptions_1 = require("../../common/exptions");
const node_crypto_1 = require("node:crypto");
const objectId_1 = require("../../common/utils/objectId");
const services_1 = require("../../common/services");
class CommentService {
    commentRepository;
    s3;
    constructor() {
        this.commentRepository = new comment_repository_1.CommentRepository();
        this.s3 = new services_1.S3Service();
    }
    async createComment(params, body, files, user) {
        const { postId } = params;
        const { content, tags, commentId } = body;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `comments/${(0, node_crypto_1.randomUUID)()}`,
            });
        }
        const commentData = {
            createdBy: user._id,
            postId: (0, objectId_1.toObjectId)(postId),
            content: content,
            attachments,
            tags: tags ? tags.map((t) => (0, objectId_1.toObjectId)(t)) : [],
        };
        if (commentId) {
            commentData.commentId = (0, objectId_1.toObjectId)(commentId);
        }
        const comment = await this.commentRepository.createOne({
            data: commentData,
        });
        if (!comment)
            throw new exptions_1.BadRequestExpetions("Fail to create comment");
        return comment;
    }
    async updateComment(commentId, userId, body, files) {
        const comment = await this.commentRepository.findOne({
            filter: { _id: (0, objectId_1.toObjectId)(commentId), createdBy: userId },
        });
        if (!comment)
            throw new exptions_1.NotFoundExpetions("Comment not found");
        const filesToRemove = body.removeFiles || [];
        let newAttachments = [];
        if (files && Array.isArray(files) && files.length > 0) {
            newAttachments = await this.s3.uploadAssets({
                files: files,
                path: `comments/${(0, node_crypto_1.randomUUID)()}`,
            });
        }
        const updatedComment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: (0, objectId_1.toObjectId)(commentId), createdBy: userId },
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
            throw new exptions_1.BadRequestExpetions("Failed to update comment");
        return updatedComment;
    }
    async reactOnComment(commentId, userId, reaction) {
        await this.commentRepository.updateOne({
            filter: { _id: (0, objectId_1.toObjectId)(commentId) },
            update: { $pull: { reactions: { user: userId } } },
        });
        const update = reaction >= 0
            ? { $push: { reactions: { user: userId, type: reaction } } }
            : {};
        const comment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: (0, objectId_1.toObjectId)(commentId) },
            update: update,
        });
        if (!comment)
            throw new exptions_1.NotFoundExpetions("Comment not found");
        return comment;
    }
    async deleteComment(commentId, userId) {
        const deleted = await this.commentRepository.deleteOne({
            filter: { _id: (0, objectId_1.toObjectId)(commentId), createdBy: userId },
        });
        return deleted.deletedCount === 1;
    }
    async getCommentsByPost(postId) {
        return await this.commentRepository.find({
            filter: { postId: (0, objectId_1.toObjectId)(postId), commentId: null },
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
exports.CommentService = CommentService;
exports.commentService = new CommentService();
