import * as userTypesgql from "./user.types.gql";
import * as userArgs from "./user.args.gql";
import { userResolverGql, UserResolverGql } from "./user.resolver.gql";
import { GraphQLString } from "graphql";

export class UsergqlSchema {
  private userResolverGql: UserResolverGql;
  constructor() {
    this.userResolverGql = userResolverGql;
  }
  // في ملف user.types.gql أو حيث تعرف الـ UsergqlSchema
  registerQuery() {
    return {
      profile: {
        type: userTypesgql.profile,
        args: userArgs.profile,
        resolve: this.userResolverGql.profile,
      },
    };
  }

  registerMutation() {
    return {
      like: {
        type: GraphQLString,
        description: "",
        resolve: () => {},
      },
    };
  }
}
export const usergqlSchema = new UsergqlSchema();
