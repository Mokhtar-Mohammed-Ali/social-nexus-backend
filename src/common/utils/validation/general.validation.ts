import { z } from "zod";

export const generalValidationFields = {
  email: z.email(),
  password: z
    .string({ error: "Password must be at least 8 characters" })
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
  userName: z
    .string({ error: "Username must be between 2 and 25 characters" })
    .min(2)
    .max(25),
  phone: z
    .string({ error: "Phone number must be at least 10 characters" }).regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/, "Invalid phone number format"),
   
  otp: z.string({ error: "OTP must be 6 characters" }).length(6).regex(/^\d{6}$/),

  confirmPassword: z.string({ error: "Confirm Password must match Password" }),
};
