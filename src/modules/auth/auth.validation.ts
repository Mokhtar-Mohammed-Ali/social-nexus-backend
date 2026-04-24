import { z } from "zod";
import { generalValidationFields } from "../../common/utils";

/* loginValidation */
export const loginValidation = {
  body: z.strictObject({
    email: generalValidationFields.email,
    password: generalValidationFields.password,
  })
};

/* signup */
export const signupValidation = {
  body: loginValidation.body
    .extend({
      userName: generalValidationFields.userName,
      phone: generalValidationFields.phone.optional(),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
};

/* confirmEmail */
export const confirmEmailValidation = {
  body: z.strictObject({
    email: generalValidationFields.email,
    otp: generalValidationFields.otp,
  }),
};

/* resendConfirmEmail */
export const resendConfirmEmailValidation = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};

/* resetPasswordCode */
export const resetPasswordCodeValidation = {
  body: confirmEmailValidation.body
    .extend({
      password: generalValidationFields.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};
