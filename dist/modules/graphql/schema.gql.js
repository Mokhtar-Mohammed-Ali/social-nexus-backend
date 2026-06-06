"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const user_1 = require("../user");
const post_1 = require("../post");
const RootQuery = new graphql_1.GraphQLObjectType({
    name: "RootQuery",
    description: "Root Query for all API endpoints",
    fields: {
        ...user_1.usergqlSchema.registerQuery(),
        ...post_1.postSchemaGql.registerQuery(),
    },
});
const RootMutation = new graphql_1.GraphQLObjectType({
    name: "RootMutation",
    description: "Root Mutation for all API endpoints",
    fields: {
        ...user_1.usergqlSchema.registerMutation(),
        ...post_1.postSchemaGql.registerNutation(),
    },
});
exports.schema = new graphql_1.GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
});
