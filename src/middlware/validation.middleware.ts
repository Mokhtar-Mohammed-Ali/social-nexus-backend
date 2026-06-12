import { Socket } from 'socket.io';
import { NextFunction, Request, Response } from "express";
import { BadRequestExpetions, mapGeaphQLError } from "../common/exptions";
import { ZodError, ZodType } from "zod";
import path from "node:path";

type keyType = keyof Request;
type scchemaType = Partial<Record<keyType, ZodType>>;

type issueType = Array<{
  key: keyType;
  isseus: Array<{
    message: string;
    path: (number | string | null | undefined | symbol)[];
  }>;
}>;
export const validation = (schema: scchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isseus: issueType = [];

    for (const key of Object.keys(schema) as keyType[]) {
      if (!schema[key]) continue;
      if (req.file) {
        req.body.file = req.file;
      }
      if (req.files) {
        req.body.files = req.files;
      }
      const validationResult = schema[key].safeParse(req[key]);
      if (!validationResult.success) {
        const error = validationResult.error as ZodError;
        isseus.push({
          key,
          isseus: error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        });
      }
    }

    if (isseus.length) {
      throw new BadRequestExpetions("validation error", isseus);
    }
    next();
  };
};

export const Socketvalidation = async <T>(schema: ZodType, args: T) :Promise<boolean>=> {
  const validationResult = schema.safeParse(args);
  if (!validationResult.success) {
    throw new BadRequestExpetions("validation error", {
        issues: validationResult.error.issues.map((issue) => {
          return { path: issue.path, message: issue.message };
        }),
      });
    }
    

  return true
};
export const GQLvalidation = async <T>(schema: ZodType, args: T) :Promise<boolean>=> {
  const validationResult = schema.safeParse(args);
  if (!validationResult.success) {
    throw mapGeaphQLError(
      new BadRequestExpetions("validation error", {
        issues: validationResult.error.issues.map((issue) => {
          return { path: issue.path, message: issue.message };
        }),
      }),
    );
  }
  return true
};
