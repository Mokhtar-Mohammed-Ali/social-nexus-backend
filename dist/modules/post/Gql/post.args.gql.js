"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactPostArgsGql = exports.postArgsGql = void 0;
const graphql_1 = require("graphql");
const post_types_gql_1 = require("./post.types.gql");
exports.postArgsGql = {
    page: { type: graphql_1.GraphQLInt },
    size: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString }
};
exports.reactPostArgsGql = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    reaction: { type: post_types_gql_1.ReactionGQLEnumType }
};
