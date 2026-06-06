"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commSchemaValidation = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../common/utils");
const multer_1 = require("../../common/utils/multer");
exports.commSchemaValidation = {
    params: zod_1.z.strictObject({
        postId: utils_1.generalValidationFields.id,
    }),
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().min(1).max(500),
        commentId: utils_1.generalValidationFields.id.optional(),
        files: zod_1.z
            .array(utils_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        tags: zod_1.z.array(utils_1.generalValidationFields.id).optional(),
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
