import { Types } from "mongoose";
import { z } from "zod";

export const generalValidationFields = {
  id: z.string().refine((val) => Types.ObjectId.isValid(val),"Invalid ObjectId format"),
   
  email: z.email(),
  password: z
    .string({ error: "Password must be at least 8 characters" })
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
  userName: z
    .string({ error: "Username must be between 2 and 25 characters" })
    .min(2)
    .max(25),
  phone: z
    .string({ error: "Phone number must be at least 10 characters" }).regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/, "Invalid phone number format"),
   
  otp: z.string({ error: "OTP must be 6 characters" }).length(6).regex(/^\d{6}$/),

  confirmPassword: z.string({ error: "Confirm Password must match Password" }),
  file: function (mimetype: string[]) {
  return z
    .strictObject({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.enum(mimetype),
      buffer: z.any().optional(),
      path: z.string().optional(),
      size: z.number(),
    })
    .superRefine((args, ctx) => {
      if (!args.path && !args.buffer) {
        ctx.addIssue({
          code: "custom",
          message: "buffer is required",
          path: ["buffer"],
        });
      }
    });
}
};
export const paginationValidationSchema = {
  query: z.strictObject({
page:z.coerce.number().int().positive().default(1).optional(),
size:z.coerce.number().int().positive().max(100).default(5).optional(),
search:z.string().optional(),
  })
}
export type paginateDto=z.infer<typeof paginationValidationSchema.query>
