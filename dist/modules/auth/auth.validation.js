"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordCodeValidation = exports.resendConfirmEmailValidation = exports.confirmEmailValidation = exports.signupValidation = exports.loginValidation = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../common/utils");
exports.loginValidation = {
    body: zod_1.z.strictObject({
        email: utils_1.generalValidationFields.email,
        password: utils_1.generalValidationFields.password,
    })
};
exports.signupValidation = {
    body: exports.loginValidation.body
        .extend({
        userName: utils_1.generalValidationFields.userName,
        phone: utils_1.generalValidationFields.phone.optional(),
        confirmPassword: zod_1.z.string(),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
};
exports.confirmEmailValidation = {
    body: zod_1.z.strictObject({
        email: utils_1.generalValidationFields.email,
        otp: utils_1.generalValidationFields.otp,
    }),
};
exports.resendConfirmEmailValidation = {
    body: zod_1.z.strictObject({
        email: utils_1.generalValidationFields.email,
    }),
};
exports.resetPasswordCodeValidation = {
    body: exports.confirmEmailValidation.body
        .extend({
        password: utils_1.generalValidationFields.password,
        confirmPassword: zod_1.z.string(),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
};
