import { GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql";
import { usergqlSchema } from "../user";
import { postSchemaGql } from "../post";

// 1. تعريف الـ Query الرئيسي
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  description: "Root Query for all API endpoints",
  fields: {
    ...usergqlSchema.registerQuery(),
    ...postSchemaGql.registerQuery(),
  },
});

// 2. تعريف الـ Mutation الرئيسي
const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  description: "Root Mutation for all API endpoints",
  fields: {
    ...usergqlSchema.registerMutation(),
    ...postSchemaGql.registerNutation(),
    
  },
});

// 3. تصدير الـ Schema النهائي
export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
