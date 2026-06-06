"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolverGql = exports.UserResolverGql = void 0;
const user_authorization_1 = require("./../user.authorization");
const user_sevice_1 = require("../user.sevice");
const middlware_1 = require("../../../middlware");
const user_validation_1 = require("../user.validation");
class UserResolverGql {
    userService;
    constructor() {
        this.userService = user_sevice_1.userService;
    }
    profile = async (parent, args, { user }) => {
        await (0, middlware_1.GQlAuthorization)(user_authorization_1.endPoints.profile, user);
        await (0, middlware_1.GQLvalidation)(user_validation_1.profileGql, args);
        const data = await this.userService.profile(user);
        return { message: "Hello query", data };
    };
}
exports.UserResolverGql = UserResolverGql;
exports.userResolverGql = new UserResolverGql();
