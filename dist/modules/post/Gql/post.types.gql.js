"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactOnPostResponse = exports.postListResponse = exports.PostPaginationResponse = exports.oneTypeResponse = exports.ReactionGQLEnumType = exports.AvailabilityGQLEnumType = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
const enums_1 = require("../../../common/enums");
exports.AvailabilityGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "AvailabilityGQLEnumType",
    values: {
        Public: { value: enums_1.availabilityEnum.PUBLIC },
        Friends: { value: enums_1.availabilityEnum.FRIENDS },
        Private: { value: enums_1.availabilityEnum.PRIVATE },
    },
});
exports.ReactionGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ReactionGQLEnumType",
    values: {
        Like: { value: enums_1.ReactionValue.LIKE },
        Love: { value: enums_1.ReactionValue.LOVE },
        Haha: { value: enums_1.ReactionValue.HAHA },
        Wow: { value: enums_1.ReactionValue.WOW },
        Angry: { value: enums_1.ReactionValue.ANGRY },
        Sad: { value: enums_1.ReactionValue.SAD },
    },
});
const ReactionType = new graphql_1.GraphQLObjectType({
    name: "ReactionType",
    fields: () => ({
        user: { type: user_types_gql_1.oneUsetType },
        type: { type: exports.ReactionGQLEnumType },
    }),
});
exports.oneTypeResponse = new graphql_1.GraphQLObjectType({
    name: "oneTypeResponse",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        folderId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        createdBy: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.oneUsetType) },
        updatedBy: { type: user_types_gql_1.oneUsetType },
        reactions: { type: new graphql_1.GraphQLList(ReactionType) },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_1.oneUsetType) },
        availability: { type: exports.AvailabilityGQLEnumType },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.PostPaginationResponse = new graphql_1.GraphQLObjectType({
    name: "PostPaginationResponse",
    fields: () => ({
        docs: { type: new graphql_1.GraphQLList(exports.oneTypeResponse) },
        currentPage: { type: graphql_1.GraphQLInt },
        pages: { type: graphql_1.GraphQLInt },
        size: { type: graphql_1.GraphQLInt },
    })
});
exports.postListResponse = new graphql_1.GraphQLObjectType({
    name: "postListResponse",
    fields: () => ({
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.PostPaginationResponse }
    }),
});
exports.reactOnPostResponse = new graphql_1.GraphQLObjectType({
    name: "reactOnPostResponse",
    fields: () => ({
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.oneTypeResponse }
    })
});
