"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.oneUsetType = exports.RoleGQLEnumType = exports.ProviderGQLEnumType = exports.GenderGQLEnumType = void 0;
const graphql_1 = require("graphql");
const enums_1 = require("../../../common/enums");
exports.GenderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: enums_1.GenderEnumms.Male },
        Female: { value: enums_1.GenderEnumms.Female },
    },
});
exports.ProviderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        Google: { value: enums_1.PROVIDERENUM.GOOGLE },
        System: { value: enums_1.PROVIDERENUM.SYSTEM },
    },
});
exports.RoleGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        Admin: { value: enums_1.ROLEENUM.Admin },
        User: { value: enums_1.ROLEENUM.User },
    },
});
exports.oneUsetType = new graphql_1.GraphQLObjectType({
    name: "userType",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        userName: { type: graphql_1.GraphQLString },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        DOB: { type: graphql_1.GraphQLString },
        confirmEmail: { type: graphql_1.GraphQLString },
        changeCredentialsTime: { type: graphql_1.GraphQLString },
        password: { type: graphql_1.GraphQLString },
        oldPassword: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        phone: { type: graphql_1.GraphQLString },
        profilePicCover: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        profilePic: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        profileGallery: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        gender: { type: exports.GenderGQLEnumType },
        role: { type: exports.RoleGQLEnumType },
        provider: { type: exports.ProviderGQLEnumType },
        visitCount: { type: graphql_1.GraphQLInt },
        is2FA: { type: graphql_1.GraphQLBoolean },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        notificationsEnabled: { type: graphql_1.GraphQLBoolean },
        friends: { type: new graphql_1.GraphQLList(exports.oneUsetType) },
    }),
});
exports.profile = new graphql_1.GraphQLObjectType({
    name: "profileResponse",
    description: "",
    fields: {
        message: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        data: {
            type: exports.oneUsetType,
        },
    },
});
