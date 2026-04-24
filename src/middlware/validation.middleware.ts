import { NextFunction, Request, Response } from "express";
import { BadRequestExpetions } from "../common/exptions";
import { ZodError, ZodType } from "zod";

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
