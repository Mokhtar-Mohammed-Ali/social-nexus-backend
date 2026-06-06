import { z } from "zod";
import { generalValidationFields } from "../../common/utils";

// طلب الـ OTP أو اللينك
export const requestForgotPasswordValidation = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};

// إعادة التعيين بالـ OTP
export const resetPasswordCodeValidation = {
  body: z
    .strictObject({
      email: generalValidationFields.email,
      otp: generalValidationFields.otp,
      password: generalValidationFields.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

// إعادة التعيين باللينك
export const resetPasswordLinkValidation = {
  query: z.strictObject({
    token: z.string().uuid(),
  }),
  body: z
    .strictObject({
      password: generalValidationFields.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};



//Gql

export const profileGql=z.strictObject({
  search:z.string().min(2).optional()
})