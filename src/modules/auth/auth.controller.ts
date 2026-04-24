import * as validators from "./auth.validation";
import { successResponse } from "./../../common/response/success.response";
import { Router, Request, Response, NextFunction } from "express";
import AuthService from "./auth.service.js";
import { IloginResponse, IsignUpResponse } from "./auth.entity";
import { validation } from "../../middlware";

const router = Router();

// signup route
router.post(
  "/signUp",
  validation(validators.signupValidation),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const data = await AuthService.signUp(req.body);
    return successResponse<any>({
      res,
      data,
      status: 201,
    });
  },
);

//Otp confirm email route

router.patch(
  "/confirm-email",
  validation(validators.confirmEmailValidation),
  async (req, res, next) => {
    await AuthService.confirmEmail(req.body);

    return successResponse({
      res,
      status: 200,
    });
  },
);

// resend confirm email otp
router.patch(
  "/resend-confirm-email",
  validation(validators.resendConfirmEmailValidation),
  async (req, res, next) => {
    await AuthService.resendConfirmEmail(req.body);

    return successResponse({
      res,
    });
  },
);

// login
router.post(
  "/login",
  validation(validators.loginValidation),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await AuthService.login(req.body, req.protocol + "://" + req.host) 
    return successResponse< IloginResponse >({
      res,
      data,
    });
  },
  // sign in with google route
  router.post("/signup/gmail", async (req, res, next) => {
  const {status, credentials} = await AuthService.signupWithGmail(req.body.idToken,`${req.protocol}://${req.host}`);

  return  successResponse<IsignUpResponse>({
    res,
    status: status,
    message: "Done",
    data: { ...credentials } as IsignUpResponse,
  });
}));
 
// forgot password route

export default router;
