import { NextFunction, Request, Response } from "express";
import { ROLEENUM } from "../common/enums";
import { ForbiddenExpetions } from "../common/exptions";

export const authorization = (AccessRoles: ROLEENUM[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!AccessRoles.includes(req.user.role)) {
      throw new ForbiddenExpetions("you don't have access to this resource");
    }
    return next();
  };
};
