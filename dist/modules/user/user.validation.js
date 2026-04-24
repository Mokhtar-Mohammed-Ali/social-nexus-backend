"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordLinkValidation = exports.resetPasswordCodeValidation = exports.requestForgotPasswordValidation = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../common/utils");
exports.requestForgotPasswordValidation = {
    body: zod_1.z.strictObject({
        email: utils_1.generalValidationFields.email,
    }),
};
exports.resetPasswordCodeValidation = {
    body: zod_1.z.strictObject({
        email: utils_1.generalValidationFields.email,
        otp: utils_1.generalValidationFields.otp,
        password: utils_1.generalValidationFields.password,
        confirmPassword: zod_1.z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
};
exports.resetPasswordLinkValidation = {
    query: zod_1.z.strictObject({
        token: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.strictObject({
        password: utils_1.generalValidationFields.password,
        confirmPassword: zod_1.z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
};
