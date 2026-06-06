import { 
  GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, 
  GraphQLNonNull, GraphQLObjectType, GraphQLString 
} from "graphql";
import { oneUsetType } from "../../user/gql/user.types.gql";
import { availabilityEnum, ReactionValue } from "../../../common/enums";

// 1. Enums
export const AvailabilityGQLEnumType = new GraphQLEnumType({
  name: "AvailabilityGQLEnumType",
  values: {
    Public: { value: availabilityEnum.PUBLIC },
    Friends: { value: availabilityEnum.FRIENDS },
    Private: { value: availabilityEnum.PRIVATE },
  },
});

export const ReactionGQLEnumType = new GraphQLEnumType({
  name: "ReactionGQLEnumType",
  values: {
    Like: { value: ReactionValue.LIKE },
    Love: { value: ReactionValue.LOVE },
    Haha: { value: ReactionValue.HAHA },
    Wow: { value: ReactionValue.WOW },
    Angry: { value: ReactionValue.ANGRY },
    Sad: { value: ReactionValue.SAD },
  },
});

// 2. Types
const ReactionType = new GraphQLObjectType({
  name: "ReactionType",
  fields: () => ({
    user: { type: oneUsetType },
    type: { type: ReactionGQLEnumType },
  }),
});

export const oneTypeResponse = new GraphQLObjectType({
  name: "oneTypeResponse",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    folderId: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLString },
    attachments: { type: new GraphQLList(GraphQLString) },
    createdBy: { type: new GraphQLNonNull(oneUsetType) },
    updatedBy: { type: oneUsetType },
    reactions: { type: new GraphQLList(ReactionType) }, 
    tags: { type: new GraphQLList(oneUsetType) },
    availability: { type: AvailabilityGQLEnumType },
    deletedAt: { type: GraphQLString },
    restoredAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

// 3. Responses
export const PostPaginationResponse = new GraphQLObjectType({
  name: "PostPaginationResponse",
  fields: () => ({
    docs: { type: new GraphQLList(oneTypeResponse) },
    currentPage: { type: GraphQLInt },
    pages: { type: GraphQLInt },
    size: { type: GraphQLInt },
  })
});

export const postListResponse = new GraphQLObjectType({
  name: "postListResponse",
  fields: () => ({
    message: { type: new GraphQLNonNull(GraphQLString) },
    data: { type: PostPaginationResponse }
  }),
});

export const reactOnPostResponse = new GraphQLObjectType({
  name: "reactOnPostResponse",
  fields: () => ({
    message: { type: new GraphQLNonNull(GraphQLString) },
    data: { type: oneTypeResponse }
  })
});