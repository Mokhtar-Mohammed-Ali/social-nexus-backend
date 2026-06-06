"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const validation_middleware_1 = require("./../../middlware/validation.middleware");
const express_1 = require("express");
const response_1 = require("../../common/response");
const middlware_1 = require("../../middlware");
const user_authorization_1 = require("./user.authorization");
const enums_1 = require("../../common/enums");
const validators = __importStar(require("./user.validation"));
const multer_1 = require("../../common/utils/multer");
const user_sevice_1 = require("./user.sevice");
const router = (0, express_1.Router)();
router.get("/", (0, middlware_1.authentication)(), (0, middlware_1.authorization)(user_authorization_1.endPoints.profile), async (req, res, next) => {
    const data = await user_sevice_1.userService.profile(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.post("/logout", (0, middlware_1.authentication)(), async (req, res, next) => {
    const status = await user_sevice_1.userService.logout(req.body, req.user, req.decoded);
    return (0, response_1.successResponse)({
        res,
        data: { status },
    });
});
router.post("/refresh", (0, middlware_1.authentication)(enums_1.TOKENTYPEENUM.REFRESH), async (req, res, next) => {
    const credentials = await user_sevice_1.userService.rotateToken(req.user, req.decoded, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({
        res,
        status: 201,
        data: { ...credentials },
    });
});
router.post("/forgot-password/otp", (0, validation_middleware_1.validation)(validators.requestForgotPasswordValidation), async (req, res) => {
    await user_sevice_1.userService.requestForgotPasswordOtp(req.body.email);
    return (0, response_1.successResponse)({ res, message: "OTP sent successfully" });
});
router.patch("/reset-password/otp", (0, validation_middleware_1.validation)(validators.resetPasswordCodeValidation), async (req, res) => {
    await user_sevice_1.userService.resetPasswordWithCode(req.body);
    return (0, response_1.successResponse)({ res, message: "Password updated" });
});
router.post("/forgot-password-link", (0, validation_middleware_1.validation)(validators.requestForgotPasswordValidation), async (req, res) => {
    const link = await user_sevice_1.userService.requestForgotPasswordLink(req.body.email, `${req.protocol}://${req.get("host")}/user`);
    return (0, response_1.successResponse)({ res, data: { link } });
});
router.patch("/reset-password-link", (0, validation_middleware_1.validation)(validators.resetPasswordLinkValidation), async (req, res) => {
    await user_sevice_1.userService.resetPasswordWithLink(req.query.token, req.body.password);
    return (0, response_1.successResponse)({ res, message: "Password updated" });
});
router.delete("/hard-delete", (0, middlware_1.authentication)(), async (req, res) => {
    const data = await user_sevice_1.userService.hardDeleteAccount(req.user._id);
    return (0, response_1.successResponse)({
        res,
        message: "Account deleted successfully",
        data,
    });
});
router.delete("/", (0, middlware_1.authentication)(), async (req, res) => {
    const data = await user_sevice_1.userService.deleteAccount(req.user._id);
    return (0, response_1.successResponse)({
        res,
        message: "Account deleted successfully",
        data,
    });
});
router.patch("/restore", (0, middlware_1.authentication)(), async (req, res) => {
    const data = await user_sevice_1.userService.restoreAccount(req.user._id);
    return (0, response_1.successResponse)({
        res,
        message: "Account restored successfully",
        data,
    });
});
router.patch("/profile-image", (0, multer_1.cloudeFileUploade)({
    storageApproache: enums_1.MulterStorage.DISK,
    validation: multer_1.fileFieldValidation.image,
    maxSize: 5,
}).single("attachment"), (0, middlware_1.authentication)(), async (req, res) => {
    const data = await user_sevice_1.userService.profileImage(req.file, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/profile-image-presigned", (0, middlware_1.authentication)(), async (req, res) => {
    const data = await user_sevice_1.userService.profileImagePresigned(req.body, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/profile-cover-image", (0, multer_1.cloudeFileUploade)({
    storageApproache: enums_1.MulterStorage.DISK,
    validation: multer_1.fileFieldValidation.image,
    maxSize: 5,
}).array("attachments", 2), (0, middlware_1.authentication)(), async (req, res) => {
    const data = await user_sevice_1.userService.profileCoverImage(req.files, req.user);
    return (0, response_1.successResponse)({ res, data });
});
exports.default = router;
