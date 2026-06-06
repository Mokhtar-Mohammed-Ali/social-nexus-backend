"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolverGql = exports.PostResolverGql = void 0;
const post_service_1 = require("../post.service");
const middlware_1 = require("../../../middlware");
const utils_1 = require("../../../common/utils");
const post_validation_1 = require("../post.validation");
class PostResolverGql {
    postService;
    constructor() {
        this.postService = post_service_1.postService;
    }
    postList = async (parent, args, { user, decoded }) => {
        await (0, middlware_1.GQLvalidation)(utils_1.paginationValidationSchema.query, args);
        const data = await this.postService.listUserPosts(args, user);
        return { message: "done", data };
    };
    reactOnpost = async (parent, { reaction, postId }, { user, decoded }) => {
        await (0, middlware_1.GQLvalidation)(post_validation_1.reactGQLSchemaValidation, { reaction, postId });
        const data = await this.postService.reactOnPost({ postId }, { reaction }, user);
        return { message: "done", data };
    };
}
exports.PostResolverGql = PostResolverGql;
exports.postResolverGql = new PostResolverGql();
