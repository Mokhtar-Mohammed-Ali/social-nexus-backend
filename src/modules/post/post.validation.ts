import { z } from "zod";
import { availabilityEnum, ReactionValue } from "../../common/enums";
import mongoose from "mongoose";
import { generalValidationFields } from "../../common/utils";
import { fileFieldValidation } from "../../common/utils/multer";

//create post validation
export const postSchemaValidation = {
  body: z
    .strictObject({
      content: z.string().min(1).max(500),
      files: z
        .array(generalValidationFields.file(fileFieldValidation.image))
        .optional(),
      availability: z.enum(availabilityEnum).default(availabilityEnum.PUBLIC),
      tags: z
        .array(
          z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
          }),
        )
        .refine((tags) => new Set(tags).size === tags.length)
        .optional(),
      availablity: z.coerce
        .number()
        .default(availabilityEnum.PUBLIC as unknown as number),
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
//react
export const reactSchemaValidation = {
  params: z.strictObject({
    postId: generalValidationFields.id,
  }),
  query: z.strictObject({
    reaction: z.coerce.number(),
  }),
};

// update post validation
export const updatePostSchemaValidation = {
  params: z.strictObject({
    postId: generalValidationFields.id,
  }),
  body: z
    .strictObject({
      content: z.string().min(1).max(500).optional(),
      files: z
        .array(generalValidationFields.file(fileFieldValidation.image))
        .optional(),
      removeFiles: z.array(z.string()).optional(),
      availability: z.coerce
        .number()
        .refine((val) => [0, 1, 2].includes(val), {
          // ضع هنا القيم المسموحة لديك
          message: "Invalid option: expected one of 0|1|2",
        })
        .default(0) // القيمة الافتراضية
        .optional(),
      tags: z.array(generalValidationFields.id).optional(),
      removeTags: z.array(z.string()).optional(),

      availablity: z.coerce
        .number()
        .default(availabilityEnum.PUBLIC as unknown as number),
    })
    .superRefine((data, ctx) => {
      if (!Object.values(data)?.length) {
        ctx.addIssue({
          code: "custom",
          message: "at least one field must be provided to update",
        });
      }
      if (!data.content && (!data.files || data.files.length === 0)) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "content or files must be provided",
        });
      }
    }),
};

// gql

// react on post gql

export const reactGQLSchemaValidation = z.strictObject({
  postId: generalValidationFields.id,

  reaction:z.nativeEnum(ReactionValue),
});
