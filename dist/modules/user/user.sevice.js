"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const domain_exeptions_1 = require("./../../common/exptions/domain.exeptions");
const config_service_1 = require("../../config/config.service");
const services_1 = require("../../common/services");
const exptions_1 = require("../../common/exptions");
const enums_1 = require("../../common/enums");
const security_1 = require("../../common/utils/security");
const DB_1 = require("../../DB");
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("../../common/utils");
const dayjs_1 = __importDefault(require("dayjs"));
class UserService {
    redis;
    tokenService;
    userRepository;
    s3;
    constructor() {
        this.userRepository = new DB_1.userRepository();
        this.redis = services_1.redisServices;
        this.tokenService = new services_1.TokenService();
        this.s3 = services_1.s3Service;
    }
    async profile(user) {
        return user.toJSON();
    }
    async rotateToken(user, { jti, iat, sub }, issuer) {
        const nowInMs = Date.now();
        const tokenExpiryInMs = (iat + config_service_1.ACCESS_TOKEN_EXPIRATION) * 1000;
        if (tokenExpiryInMs >= nowInMs + 30000) {
            throw new exptions_1.ConflictException("Token is not expired yet");
        }
        const refreshExpiry = iat + config_service_1.REFRESH_TOKEN_EXPIRATION;
        const currentTimestamp = Math.floor(nowInMs / 1000);
        const remainingTTL = refreshExpiry - currentTimestamp;
        await this.tokenService.createRevokeTokenKey({
            userId: sub,
            jti,
            ttl: remainingTTL > 0 ? remainingTTL : 1,
        });
        return await this.tokenService.createloginCredentials(user, issuer);
    }
    async logout({ flag }, user, { jti, iat, sub }) {
        let status = 200;
        switch (flag) {
            case enums_1.LOGOUTENUM.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                const keys = await this.redis.allKeys(`${this.redis.revokeTokenKeyPrefix(sub)}`);
                if (keys.length > 0)
                    await this.redis.deleteKey(keys);
                break;
            default:
                const expiryDate = iat + config_service_1.REFRESH_TOKEN_EXPIRATION;
                const now = Math.floor(Date.now() / 1000);
                const ttlForRedis = expiryDate - now;
                await this.tokenService.createRevokeTokenKey({
                    userId: sub,
                    jti,
                    ttl: ttlForRedis > 0 ? ttlForRedis : 1,
                });
                status = 201;
                break;
        }
        return status;
    }
    async requestForgotPasswordOtp(email) {
        const user = await this.userRepository.findOne({
            filter: { email, provider: enums_1.PROVIDERENUM.SYSTEM },
            options: { lean: true },
        });
        if (!user)
            throw new domain_exeptions_1.NotFoundExpetions("Account not found");
        const otp = (0, utils_1.createNumberOtp)();
        const hashedOtp = await (0, security_1.generateHash)({ plainText: otp });
        await this.redis.set({
            key: `OTP:forgotPassword:${email}`,
            value: hashedOtp,
            ttl: 600,
        });
        await (0, services_1.sendEmail)({
            to: email,
            subject: enums_1.emailEnum.forgot_Bassword,
            html: (0, services_1.verifyEmailTemplate)({
                code: otp,
                title: "Your Password Reset OTP",
            }),
        });
    }
    async resetPasswordWithCode(inputs) {
        const { email, otp, password } = inputs;
        const otpKey = `OTP:forgotPassword:${email}`;
        const hashedOtp = await this.redis.get(otpKey);
        if (!hashedOtp)
            throw new domain_exeptions_1.NotFoundExpetions("Expired or invalid OTP");
        const isOtpValid = await (0, security_1.compareHash)({
            plainText: otp,
            cipherText: hashedOtp,
        });
        if (!isOtpValid)
            throw new exptions_1.ConflictException("Invalid OTP");
        const user = await this.userRepository.findOneAndUpdate({
            filter: { email, provider: enums_1.PROVIDERENUM.SYSTEM },
            update: {
                $set: {
                    password: await (0, security_1.generateHash)({ plainText: password }),
                    changeCredentialsTime: new Date(),
                },
            },
            options: { new: true },
        });
        if (!user)
            throw new domain_exeptions_1.NotFoundExpetions("User not found");
        const prefix = this.redis.revokeTokenKeyPrefix(user._id.toString());
        const tokenKeys = await this.redis.allKeys(prefix);
        const keysToDelete = [...tokenKeys, otpKey];
        await this.redis.deleteKey(keysToDelete);
    }
    async requestForgotPasswordLink(email, issuer) {
        const user = await this.userRepository.findOne({
            filter: { email, provider: enums_1.PROVIDERENUM.SYSTEM },
            options: { lean: true },
        });
        if (!user)
            throw new domain_exeptions_1.NotFoundExpetions("Account not found");
        const resetToken = crypto_1.default.randomUUID();
        const linkKey = `link:forgotPassword:${resetToken}`;
        await this.redis.set({ key: linkKey, value: email, ttl: 600 });
        const link = `${issuer}/reset-password-link?token=${resetToken}`;
        await (0, services_1.sendEmail)({
            to: email,
            subject: "Reset Password Link",
            html: `<h1>Reset Your Password</h1><p>Click <a href="${link}" style="color: blue; font-weight: bold;font-size: 16px;">Click here</a> to reset your password.</p>`,
        });
        return link;
    }
    async resetPasswordWithLink(token, password) {
        const linkKey = `link:forgotPassword:${token}`;
        const email = await this.redis.get(linkKey);
        if (!email)
            throw new domain_exeptions_1.BadRequestExpetions("Invalid or expired link");
        const user = await this.userRepository.findOneAndUpdate({
            filter: { email, provider: enums_1.PROVIDERENUM.SYSTEM },
            update: {
                $set: {
                    password: await (0, security_1.generateHash)({ plainText: password }),
                    changeCredentialsTime: new Date(),
                },
            },
            options: { new: true },
        });
        if (!user)
            throw new domain_exeptions_1.NotFoundExpetions("Account not found");
        await this.redis.deleteKey(linkKey);
        const prefix = this.redis.revokeTokenKeyPrefix(user._id.toString());
        const tokenKeys = await this.redis.allKeys(prefix);
        if (tokenKeys.length > 0)
            await this.redis.deleteKey(tokenKeys);
    }
    async hardDeleteAccount(userId) {
        const account = await this.userRepository.deleteOne({
            filter: { _id: userId, force: true },
        });
        if (!account.deletedCount)
            throw new domain_exeptions_1.NotFoundExpetions("User not found");
        await this.s3.deleteFolderContent({
            prifix: `Users/${userId.toString()}`,
        });
        return account;
    }
    async deleteAccount(userId) {
        const user = await this.userRepository.findOneAndUpdate({
            filter: { _id: userId },
            update: {
                deletedAt: new Date(),
                scheduledForDeletionAt: (0, dayjs_1.default)().add(30, "day").toDate(),
                $unset: { restoredAt: 1 },
            },
            options: { new: true },
        });
        if (!user)
            throw new domain_exeptions_1.NotFoundExpetions("User not found");
        return user;
    }
    async restoreAccount(userId) {
        const user = await this.userRepository.findOneAndUpdate({
            filter: { _id: userId },
            update: {
                restoredAt: new Date(),
                $unset: { deletedAt: 1, scheduledForDeletionAt: 1 },
            },
            options: { new: true },
        });
        if (!user)
            throw new domain_exeptions_1.NotFoundExpetions("User not found");
        return user;
    }
    async profileImage(file, user) {
        const oldImageKey = user.profilePic;
        const { Key } = await this.s3.uploadLargeAsset({
            file,
            path: `users/${user._id}/profile`,
            storageApproache: enums_1.MulterStorage.DISK,
        });
        if (oldImageKey) {
            await this.s3.deleteAsset({ Key: oldImageKey });
        }
        user.profilePic = Key;
        await user.save();
        return user.toJSON();
    }
    async profileImagePresigned({ ContentType, originalname, }, user) {
        const { url } = await this.s3.PresignedUploadLink({
            ContentType,
            originalname,
            path: `users/${user._id}/profile`,
        });
        return { user, url };
    }
    async profileCoverImage(files, user) {
        const oldCoverKeys = user.profilePicCover;
        const urls = await this.s3.uploadAssets({
            files,
            path: `users/${user._id}/profile/cover`,
            storageApproache: enums_1.MulterStorage.DISK,
            uploadApproache: enums_1.UploadsEnum.SMALL,
        });
        user.profilePicCover = urls;
        await user.save();
        if (oldCoverKeys?.length) {
            await this.s3.deleteAssets({
                Keys: oldCoverKeys.map((ele) => {
                    return { Key: ele };
                }),
            });
        }
        return user.toJSON();
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
