"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
exports.generalValidationFields = {
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
};
