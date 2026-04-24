import { NextFunction, Request, Response } from "express";
import { TokenService } from "../common/services";
import { TOKENTYPEENUM } from "../common/enums";
import { UnauthorizedExpetions } from "../common/exptions";
// export interface Irequset extends Request {
//     user?: HydratedDocument<IUser>;
//     decoded?: JwtPayload;
// }
export const authentication = (
  tokenType: TOKENTYPEENUM = TOKENTYPEENUM.ACCESS,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tokenService = new TokenService();

    const [key, credential] = req.headers?.authorization?.split(" ") || [];
    console.log({ key, credential });

    if (!key || !credential) {
      throw new UnauthorizedExpetions("Missing authorization");
    }

    switch (key) {
      case "Basic":
        break;
      default:
        const { user, decoded } = await tokenService.decodeToken({
          token: credential,
          tokenType,
        });
        req.user = user;
        req.decoded = decoded;
        break;
    }

    next();
  };
};
