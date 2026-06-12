import { HydratedDocument, Types } from "mongoose";
import { IPagination, IPost, IUser } from "../../common/interfaces";
import {
  CreatePostDTO,
  reactParamsPostDTO,
  reactQueryPostDTO,
  updateBodyPostDTO,
  updateParamsPostDTO,
} from "./post.DTO";
import { userRepository } from "../../DB";
import {
  NotificationService,
  redisServices,
  Redisservices,
  S3Service,
  s3Service,
} from "../../common/services";
import { PostRepository } from "../../DB/DataBaseRepository/post.repository";
import { BadRequestExpetions, NotFoundExpetions } from "../../common/exptions";
import { randomUUID } from "node:crypto";
import { getAvailability } from "../../common/utils/post.utils";
import { paginateDto } from "../../common/utils";
import { toObjectId } from "../../common/utils/objectId";
import { PopulateOptions } from "mongoose";
import { RealTimeGaeWay, realTimeGateWay } from "../realTime";

export class PostService {
  private populate: PopulateOptions[] = [
    { path: "createdBy" },
    { path: "tags" },
    { path: "updatedBy" },
    { path: "reactions.user" },
    // { path: "comments", populate: [{ path: "reply", populate: [{ path: "reply" }] }] }
  ];
  private readonly userRepository: userRepository;
  private readonly PostRepository: PostRepository;
  private readonly redis: Redisservices;
  private readonly notification: NotificationService;
  private readonly s3: S3Service;
  private realTime: RealTimeGaeWay;
  constructor() {
    this.userRepository = new userRepository();
    this.realTime = realTimeGateWay;
    this.PostRepository = new PostRepository();
    // this.notificationRepository = new NotificationRepository();
    this.redis = redisServices;
    this.s3 = s3Service;
    this.notification = new NotificationService();
  }
  // create post
  async createPost(
    { files = [], availability, content, tags }: CreatePostDTO,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    const mentiones: Types.ObjectId[] = [];
    const FCM_TOKENS: string[] = [];
    if (tags?.length) {
      const mentionedAccount = await this.userRepository.find({
        filter: {
          _id: { $in: tags },
        },
      });
      if (mentionedAccount.length != tags.length) {
        throw new NotFoundExpetions("not found som or all users mentioned");
      }
      for (const tag of tags) {
        mentiones?.push(Types.ObjectId.createFromHexString(tag));
        ((await this.redis.getFCMs(tag)) || []).map((token: string) => {
          return FCM_TOKENS.push(token);
        });
      }
    }
    const folderId = randomUUID();
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files: files as Express.Multer.File[],
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
        content: content as string,
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
      throw new BadRequestExpetions("fail to create ypur post");
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

  // // list user posts
  // async listUserPosts(
  //   { page, size, search }: paginateDto,
  //   user: HydratedDocument<IUser>,
  // ): Promise<IPost[]> {

  //   const posts = await this.PostRepository.find({
  //     filter: {
  //     $or:getAvailability(user)
  //     },
  //   });

  //   return posts;
  // }
  // list user posts with pagination
  async listUserPosts(
    { page, size, search }: paginateDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPagination<IPost>> {
    const posts = await this.PostRepository.paginate({
      filter: {
        $or: getAvailability(user),
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

  // react on post

  //   async reactOnPost(
  //    {postId}: reactParamsPostDTO, {reaction}: reactQueryPostDTO,
  //     user: HydratedDocument<IUser>,
  //   ): Promise<IPost> {

  // const post=await this.PostRepository.findOneAndUpdate({
  //   filter:{
  //     _id:postId,
  //     $or:getAvailability(user)
  //   },
  //   update:{
  //     ...(Number(reaction) > 0 ? {$addToSet:{likes:user._id}}:{$pull:{likes:user._id}}  )
  //   }
  // })
  // if(!post){
  //   throw new NotFoundExpetions("post not found")
  // }

  //     return post.toJSON()
  //   }

  // react on post
  async reactOnPost(
    { postId }: reactParamsPostDTO,
    { reaction }: reactQueryPostDTO,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    await this.PostRepository.findOneAndUpdate({
      filter: { _id: postId },
      update: { $pull: { reactions: { user: user._id } } },
    });

    const updateQuery =
      reaction >= 0
        ? { $push: { reactions: { user: user._id, type: reaction } } }
        : {};

    // const post = await this.PostRepository.findOneAndUpdate({
    //   filter: {
    //     _id: postId,
    //     $or: getAvailability(user),
    //   },
    //   update: updateQuery as any,
    //   populate:this.populate
    // });

    const post = await this.PostRepository.findOneAndUpdate({
      filter: { _id: postId, $or: getAvailability(user) },
      update: updateQuery,
      populate: this.populate,
    });

    if (!post) {
      throw new NotFoundExpetions("post not found");
    }
    const owner = post.createdBy as HydratedDocument<IUser>;
    const socketIds = await this.redis.getSockets(owner._id);
    if (socketIds.length & Number(reaction) || 0 > 0) {
      this.realTime
        .getIo()
        .to(socketIds)
        .emit("likePost", { postId, userId: user._id, reaction });
    }
    return post.toJSON();
  }

  // update post
  async updatePost(
    { postId }: updateParamsPostDTO,
    {
      content,
      availability,
      files = [],
      tags = [],
      removeTags = [],
      removeFiles = [],
    }: updateBodyPostDTO,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    const post = await this.PostRepository.findOne({
      filter: {
        _id: postId,
        createdBy: user._id,
      },
    });
    if (!post) {
      throw new NotFoundExpetions("post not found");
    }
    if (
      !post.content &&
      !content &&
      !files.length &&
      post.attachments?.length == removeFiles?.length
    ) {
      throw new BadRequestExpetions("content or attachments are required");
    }
    const mentiones: Types.ObjectId[] = [];
    const FCM_TOKENS: string[] = [];
    if (tags?.length) {
      const mentionedAccount = await this.userRepository.find({
        filter: {
          _id: { $in: tags },
        },
      });
      if (mentionedAccount.length != tags.length) {
        throw new NotFoundExpetions("not found som or all users mentioned");
      }
      for (const tag of tags) {
        mentiones.push(toObjectId(tag));
        ((await this.redis.getFCMs(tag)) || []).map((token) => {
          return FCM_TOKENS.push(token);
        });
      }
    }
    const folderId = post.folderId || randomUUID();
    let attachments: string[] = [];

    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files: files as Express.Multer.File[],
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
                    removeTags.map((tag) => toObjectId(tag)),
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
      throw new NotFoundExpetions("post not found");
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

export const postService = new PostService();
