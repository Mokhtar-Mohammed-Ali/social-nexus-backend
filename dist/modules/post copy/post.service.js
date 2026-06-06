"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const mongoose_1 = require("mongoose");
const DB_1 = require("../../DB");
const services_1 = require("../../common/services");
const post_repository_1 = require("../../DB/DataBaseRepository/post.repository");
const exptions_1 = require("../../common/exptions");
const node_crypto_1 = require("node:crypto");
const post_utils_1 = require("../../common/utils/post.utils");
const objectId_1 = require("../../common/utils/objectId");
class PostService {
    userRepository;
    PostRepository;
    redis;
    notification;
    s3;
    constructor() {
        this.userRepository = new DB_1.userRepository();
        this.PostRepository = new post_repository_1.PostRepository();
        this.redis = services_1.redisServices;
        this.s3 = services_1.s3Service;
        this.notification = new services_1.NotificationService();
    }
    async createPost({ files = [], availability, content, tags }, user) {
        const mentiones = [];
        const FCM_TOKENS = [];
        if (tags?.length) {
            const mentionedAccount = await this.userRepository.find({
                filter: {
                    _id: { $in: tags },
                },
            });
            if (mentionedAccount.length != tags.length) {
                throw new exptions_1.NotFoundExpetions("not found som or all users mentioned");
            }
            for (const tag of tags) {
                mentiones?.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                ((await this.redis.getFCMs(tag)) || []).map((token) => {
                    return FCM_TOKENS.push(token);
                });
            }
        }
        const folderId = (0, node_crypto_1.randomUUID)();
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `post/${folderId}`,
            });
        }
        const post = await this.PostRepository.createOne({
            data: {
                createdBy: user._id,
                attachments,
                folderId,
                availability,
                tags: mentiones,
                content: content,
            },
        });
        if (!post) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            throw new exptions_1.BadRequestExpetions("fail to create ypur post");
        }
        if (FCM_TOKENS.length) {
            await this.notification.sendNotifications({
                tokens: FCM_TOKENS,
                data: {
                    title: "post mention",
                    body: JSON.stringify({
                        message: `${user.userName}mentioned you in this post`,
                        postId: post._id,
                    }),
                },
            });
        }
        return post.toJSON();
    }
    async listUserPosts({ page, size, search }, user) {
        const posts = await this.PostRepository.paginate({
            filter: {
                $or: (0, post_utils_1.getAvailability)(user),
                ...(search?.length
                    ? {
                        content: { $regex: search, $options: "i" },
                    }
                    : {}),
            },
            page,
            size,
        });
        return posts;
    }
    async reactOnPost({ postId }, { reaction }, user) {
        await this.PostRepository.updateOne({
            filter: { _id: postId },
            update: { $pull: { reactions: { user: user._id } } },
        });
        const updateQuery = reaction >= 0
            ? { $push: { reactions: { user: user._id, type: reaction } } }
            : {};
        const post = await this.PostRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, post_utils_1.getAvailability)(user),
            },
            update: updateQuery,
        });
        if (!post) {
            throw new exptions_1.NotFoundExpetions("post not found");
        }
        return post.toJSON();
    }
    async updatePost({ postId }, { content, availability, files = [], tags = [], removeTags = [], removeFiles = [], }, user) {
        const post = await this.PostRepository.findOne({
            filter: {
                _id: postId,
                createdBy: user._id,
            },
        });
        if (!post) {
            throw new exptions_1.NotFoundExpetions("post not found");
        }
        if (!post.content &&
            !content &&
            !files.length &&
            post.attachments?.length == removeFiles?.length) {
            throw new exptions_1.BadRequestExpetions("content or attachments are required");
        }
        const mentiones = [];
        const FCM_TOKENS = [];
        if (tags?.length) {
            const mentionedAccount = await this.userRepository.find({
                filter: {
                    _id: { $in: tags },
                },
            });
            if (mentionedAccount.length != tags.length) {
                throw new exptions_1.NotFoundExpetions("not found som or all users mentioned");
            }
            for (const tag of tags) {
                mentiones.push((0, objectId_1.toObjectId)(tag));
                ((await this.redis.getFCMs(tag)) || []).map((token) => {
                    return FCM_TOKENS.push(token);
                });
            }
        }
        const folderId = post.folderId || (0, node_crypto_1.randomUUID)();
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `post/${folderId}`,
            });
        }
        const UpdatedPost = await this.PostRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                createdBy: user._id,
            },
            update: [
                {
                    $set: {
                        content: content || post.content,
                        availability: Number(availability || post.availability),
                        updatedBy: user._id,
                        attachments: {
                            $setUnion: [
                                { $setDifference: ["$attachments", removeFiles] },
                                attachments,
                            ],
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removeTags.map((tag) => (0, objectId_1.toObjectId)(tag)),
                                    ],
                                },
                                mentiones,
                            ],
                        },
                    },
                },
            ],
        });
        if (!UpdatedPost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            throw new exptions_1.NotFoundExpetions("post not found");
        }
        if (removeFiles?.length) {
            await this.s3.deleteAssets({
                Keys: removeFiles.map((ele) => {
                    return { Key: ele };
                }),
            });
        }
        if (FCM_TOKENS.length) {
            await this.notification.sendNotifications({
                tokens: FCM_TOKENS,
                data: {
                    title: "post mention",
                    body: JSON.stringify({
                        message: `${user.userName}mentioned you in this post`,
                        postId: UpdatedPost._id,
                    }),
                },
            });
        }
        return UpdatedPost.toJSON();
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
