import {  GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { ReactionGQLEnumType } from "./post.types.gql";

export const postArgsGql={
    page:{type:GraphQLInt},
    size:{type:GraphQLInt},
    search:{type:GraphQLString}
}

export const reactPostArgsGql = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    reaction: { type: ReactionGQLEnumType } 
};