import * as postTypesGql from "./post.types.gql";
import * as postArgsGql from "./post.args.gql";
import { postResolverGql, PostResolverGql } from "./post.resolver.gql";
import { GraphQLID, GraphQLNonNull } from "graphql";
export class PostSchemaGql {
  private postResolver: PostResolverGql;

  constructor() {
    this.postResolver = postResolverGql;
  }

  registerQuery() {
    return {
        postList:{
type: postTypesGql.postListResponse,
      args: postArgsGql.postArgsGql,
      resolve: this.postResolver.postList,

    }}
      
    };


    registerNutation() {
    return {
        reactOnPost:{
type:postTypesGql.reactOnPostResponse ,
      args: {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    reaction: { type: postTypesGql.ReactionGQLEnumType } // هذا هو الاسم الجديد الصحيح
  },
      resolve:postResolverGql.reactOnpost,

    }}
      
    };
  }


export const postSchemaGql = new PostSchemaGql();
