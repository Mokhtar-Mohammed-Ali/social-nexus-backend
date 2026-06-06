import { profile } from './user.types.gql';
import { endPoints } from './../user.authorization';
import { userService, UserService } from "../user.sevice";
// import { TOKENTYPEENUM } from "../../../common/enums";

import { IUser } from "../../../common/interfaces";
import { IAuthUser } from "../../../common/types/express.types";
import { GQlAuthorization, GQLvalidation } from "../../../middlware";
import { profileGql } from '../user.validation';

export class UserResolverGql {
  private userService: UserService;
  // private token:TokenService
  constructor() {
    this.userService = userService;
    // this.token= new TokenService()
  }
// { user, decoded }: { user: HydratedDocument<IUser>, decoded: JwtPayload }  =>  context
  profile = async (parent: unknown, args: {search?:string},{ user}:IAuthUser):Promise<{message:string,data:IUser}> => {
    // console.log(context)
    //  const token=context.req.headers.authorization.split(" ")[1];
    //        const {user}= await this.token.decodeToken({token,tokenType:TOKENTYPEENUM.ACCESS})
   await GQlAuthorization(endPoints.profile,user)
   await GQLvalidation<{search?:string}>(profileGql,args)
    const data = await this.userService.profile(user);
    return { message: "Hello query", data};
  };
}
export const userResolverGql = new UserResolverGql();
