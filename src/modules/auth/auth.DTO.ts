
import {z} from "zod";
import { confirmEmailValidation, loginValidation, resendConfirmEmailValidation, signupValidation } from "./auth.validation";

export type IloginDto = z.infer<typeof loginValidation.body>;
export type IsignupDto = z.infer<typeof signupValidation.body>;
export type confirEmailDTO=z.infer<typeof confirmEmailValidation.body>
export type resendConfirEmailDTO=z.infer<typeof resendConfirmEmailValidation.body>

// export interface IloginDto {
//   email: string;
//   password: string;
// }

// export interface IsignupDto extends IloginDto {
// username: string;
// }