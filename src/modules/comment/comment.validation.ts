import { z } from "zod";
import { generalValidationFields } from "../../common/utils";
import { fileFieldValidation } from "../../common/utils/multer";

export const commSchemaValidation = {
  params: z.strictObject({
    postId: generalValidationFields.id,
  }),
  body: z
    .strictObject({
      content: z.string().min(1).max(500),
      commentId: generalValidationFields.id.optional(),
      files: z
        .array(generalValidationFields.file(fileFieldValidation.image))
        .optional(),
      tags: z.array(generalValidationFields.id).optional(), // تم تصحيح الـ optional
    })
    .superRefine((data, ctx) => {
      if (!data.content && (!data.files || data.files.length === 0)) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "content or files must be provided",
        });
      }
    }),
};
