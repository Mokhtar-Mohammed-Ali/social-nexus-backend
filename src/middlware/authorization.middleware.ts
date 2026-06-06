import { HydratedDocument } from 'mongoose';
import { NextFunction, Request, Response } from "express";
import { ROLEENUM } from "../common/enums";
import { ForbiddenExpetions, mapGeaphQLError } from "../common/exptions";
import { IUser } from '../common/interfaces';

export const authorization = (AccessRoles: ROLEENUM[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!AccessRoles.includes(req.user.role)) {
      throw new ForbiddenExpetions("you don't have access to this resource");
    }
    return next();
  };
};


export const GQlAuthorization =async (AccessRoles: ROLEENUM[],user:HydratedDocument<IUser>) :Promise<boolean>=> {
    if (!AccessRoles.includes(user.role)) {
      throw mapGeaphQLError(new ForbiddenExpetions("you don't have access to this resource")); 
    }
    return true;
  };

