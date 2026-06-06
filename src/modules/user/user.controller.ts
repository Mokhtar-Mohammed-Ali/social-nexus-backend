import { validation } from "./../../middlware/validation.middleware";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { successResponse } from "../../common/response";
import { authentication, authorization } from "../../middlware";
import { endPoints } from "./user.authorization";
import { MulterStorage, TOKENTYPEENUM } from "../../common/enums";
import * as validators from "./user.validation";
import {
  cloudeFileUploade,
  fileFieldValidation,
} from "../../common/utils/multer";
import { userService } from "./user.sevice";

const router = Router();
// profile
router.get(
  "/",
  authentication(),
  authorization(endPoints.profile),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profile(req.user);
    return successResponse({ res, data });
  },
);

//logout route
router.post("/logout", authentication(), async (req, res, next) => {
  const status = await userService.logout(
    req.body,
    req.user,
    req.decoded as { jti: string; iat: number; sub: string },
  );
  return successResponse({
    res,
    data: { status },
  });
});
// refresh token route
router.post(
  "/refresh",
  authentication(TOKENTYPEENUM.REFRESH),
  async (req, res, next) => {
    const credentials = await userService.rotateToken(
      req.user,
      req.decoded as { jti: string; iat: number; sub: string },
      `${req.protocol}://${req.host}`,
    );
    return successResponse({
      res,
      status: 201,
      data: { ...credentials },
    });
  },
);

//password route
//1- request otp
// URL: POST /user/forgot-password/otp
router.post(
  "/forgot-password/otp",
  validation(validators.requestForgotPasswordValidation),
  async (req, res) => {
    await userService.requestForgotPasswordOtp(req.body.email);
    return successResponse({ res, message: "OTP sent successfully" });
  },
);

// 2. change password with OTP
// URL: PATCH /user/reset-password/otp
router.patch(
  "/reset-password/otp",
  validation(validators.resetPasswordCodeValidation),
  async (req, res) => {
    await userService.resetPasswordWithCode(req.body);
    return successResponse({ res, message: "Password updated" });
  },
);

// 3. request forgot password link
// URL: POST /user/forgot-password/link
router.post(
  "/forgot-password-link",
  validation(validators.requestForgotPasswordValidation),
  async (req, res) => {
    const link = await userService.requestForgotPasswordLink(
      req.body.email,
      `${req.protocol}://${req.get("host")}/user`,
    );
    return successResponse({ res, data: { link } });
  },
);

// URL: PATCH /auth/reset-password-link لby default بيكون /auth/reset-password-link لكن بما إن الكنترولر اسمه user فالمسار هيكون /user/reset-password-link
router.patch(
  "/reset-password-link",
  validation(validators.resetPasswordLinkValidation),
  async (req, res) => {
    await userService.resetPasswordWithLink(
      req.query.token as string,
      req.body.password,
    );
    return successResponse({ res, message: "Password updated" });
  },
);

// hard delete account route
router.delete("/hard-delete", authentication(), async (req: Request, res: Response) => {
  const data = await userService.hardDeleteAccount(req.user._id);

  return successResponse({
    res,
    message: "Account deleted successfully",
    data,
  });
});

// softdelete account route
router.delete("/", authentication(), async (req: Request, res: Response) => {
  const data = await userService.deleteAccount(req.user._id);

  return successResponse({
    res,
    message: "Account deleted successfully",
    data,
  });
});
//restore account route
router.patch(
  "/restore",
  authentication(),
  async (req: Request, res: Response) => {
    const data = await userService.restoreAccount(req.user._id);

    return successResponse({
      res,
      message: "Account restored successfully",
      data,
    });
  },
);
//user profile image route
router.patch(
  "/profile-image",
  cloudeFileUploade({
    storageApproache: MulterStorage.DISK,
    validation: fileFieldValidation.image,
    maxSize: 5,
  }).single("attachment"),
  authentication(),
  async (req: Request, res: Response) => {
    const data = await userService.profileImage(
      req.file as Express.Multer.File,
      req.user,
    );
    return successResponse({ res, data });
  },
);

//upload profile image with presigned url
router.patch(
  "/profile-image-presigned",
 
  authentication(),
  async (req: Request, res: Response) => {
    const data = await userService.profileImagePresigned(req.body, req.user);
    return successResponse({ res, data });
  },
);

// profile cover route

router.patch(
  "/profile-cover-image",
  cloudeFileUploade({
    storageApproache: MulterStorage.DISK,
    validation: fileFieldValidation.image,
    maxSize: 5,
  }).array("attachments", 2),
  authentication(),
  async (req: Request, res: Response) => {
    const data = await userService.profileCoverImage(
      req.files as Express.Multer.File[],
      req.user,
    );
    return successResponse({ res, data });
  },
);

export default router;
