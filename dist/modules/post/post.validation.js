"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactGQLSchemaValidation = exports.updatePostSchemaValidation = exports.reactSchemaValidation = exports.postSchemaValidation = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../common/enums");
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../../common/utils");
const multer_1 = require("../../common/utils/multer");
exports.postSchemaValidation = {
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().min(1).max(500),
        files: zod_1.z
            .array(utils_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        availability: zod_1.z.enum(enums_1.availabilityEnum).default(enums_1.availabilityEnum.PUBLIC),
        tags: zod_1.z
            .array(zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId format",
        }))
            .refine((tags) => new Set(tags).size === tags.length)
            .optional(),
        availablity: zod_1.z.coerce
            .number()
            .default(enums_1.availabilityEnum.PUBLIC),
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
exports.reactSchemaValidation = {
    params: zod_1.z.strictObject({
        postId: utils_1.generalValidationFields.id,
    }),
    query: zod_1.z.strictObject({
        reaction: zod_1.z.coerce.number(),
    }),
};
exports.updatePostSchemaValidation = {
    params: zod_1.z.strictObject({
        postId: utils_1.generalValidationFields.id,
    }),
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().min(1).max(500).optional(),
        files: zod_1.z
            .array(utils_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        removeFiles: zod_1.z.array(zod_1.z.string()).optional(),
        availability: zod_1.z.coerce
            .number()
            .refine((val) => [0, 1, 2].includes(val), {
            message: "Invalid option: expected one of 0|1|2",
        })
            .default(0)
            .optional(),
        tags: zod_1.z.array(utils_1.generalValidationFields.id).optional(),
        removeTags: zod_1.z.array(zod_1.z.string()).optional(),
        availablity: zod_1.z.coerce
            .number()
            .default(enums_1.availabilityEnum.PUBLIC),
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
exports.reactGQLSchemaValidation = zod_1.z.strictObject({
    postId: utils_1.generalValidationFields.id,
    reaction: zod_1.z.nativeEnum(enums_1.ReactionValue),
});
