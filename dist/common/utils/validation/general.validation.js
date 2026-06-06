"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationValidationSchema = exports.generalValidationFields = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.generalValidationFields = {
    id: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), "Invalid ObjectId format"),
    email: zod_1.z.email(),
    password: zod_1.z
        .string({ error: "Password must be at least 8 characters" })
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
    userName: zod_1.z
        .string({ error: "Username must be between 2 and 25 characters" })
        .min(2)
        .max(25),
    phone: zod_1.z
        .string({ error: "Phone number must be at least 10 characters" }).regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/, "Invalid phone number format"),
    otp: zod_1.z.string({ error: "OTP must be 6 characters" }).length(6).regex(/^\d{6}$/),
    confirmPassword: zod_1.z.string({ error: "Confirm Password must match Password" }),
    file: function (mimetype) {
        return zod_1.z
            .strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number(),
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
exports.paginationValidationSchema = {
    query: zod_1.z.strictObject({
        page: zod_1.z.coerce.number().int().positive().default(1).optional(),
        size: zod_1.z.coerce.number().int().positive().max(100).default(5).optional(),
        search: zod_1.z.string().optional(),
    })
};
