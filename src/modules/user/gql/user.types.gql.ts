import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
  GraphQLEnumType,
} from "graphql";
import { GenderEnumms, PROVIDERENUM, ROLEENUM } from "../../../common/enums";

export const GenderGQLEnumType = new GraphQLEnumType({
  name: "GenderGQLEnumType",
  values: {
    Male: { value: GenderEnumms.Male },
    Female: { value: GenderEnumms.Female },
  },
});

export const ProviderGQLEnumType = new GraphQLEnumType({
  name: "ProviderGQLEnumType",
  values: {
    Google: { value: PROVIDERENUM.GOOGLE },
    System: { value: PROVIDERENUM.SYSTEM },
  },
});

export const RoleGQLEnumType = new GraphQLEnumType({
  name: "RoleGQLEnumType",
  values: {
    Admin: { value: ROLEENUM.Admin },
    User: { value: ROLEENUM.User },
  },
});

export const oneUsetType: GraphQLObjectType = new GraphQLObjectType({
  name: "userType",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    userName: { type: GraphQLString },
    email: { type: new GraphQLNonNull(GraphQLString) },
    DOB: { type: GraphQLString },
    confirmEmail: { type: GraphQLString },
    changeCredentialsTime: { type: GraphQLString },
    password: { type: GraphQLString },
    oldPassword: { type: new GraphQLList(GraphQLString) },
    phone: { type: GraphQLString },
    profilePicCover: { type: new GraphQLList(GraphQLString) },
    profilePic: { type: new GraphQLList(GraphQLString) },
    profileGallery: { type: new GraphQLList(GraphQLString) },
    gender: { type: GenderGQLEnumType },
    role: { type: RoleGQLEnumType },
    provider: { type: ProviderGQLEnumType },
    visitCount: { type: GraphQLInt },
    is2FA: { type: GraphQLBoolean },

    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
    restoredAt: { type: GraphQLString },
    notificationsEnabled: { type: GraphQLBoolean },
    friends: { type: new GraphQLList(oneUsetType) },
  }),
});

export const profile = new GraphQLObjectType({
  name: "profileResponse",
  description: "",
  fields: {
    message: {
      type: new GraphQLNonNull(GraphQLString),
    },
    data: {
      type: oneUsetType,
    },
  },
});
