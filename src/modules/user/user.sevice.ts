import {
  BadRequestExpetions,
  NotFoundExpetions,
} from "./../../common/exptions/domain.exeptions"; // تأكد من spelling كلمة exceptions
import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from "../../config/config.service";
import {
  redisServices,
  Redisservices,
  sendEmail,
  TokenService,
  verifyEmailTemplate,
} from "../../common/services";
import { ConflictException } from "../../common/exptions";
import { emailEnum, LOGOUTENUM, PROVIDERENUM } from "../../common/enums";
import { compareHash, generateHash } from "../../common/utils/security";
import { userRepository } from "../../DB";
import crypto from "crypto";
import { createNumberOtp } from "../../common/utils";

class userService {
  private readonly redis: Redisservices;
  private readonly tokenService: TokenService;
  private readonly userRepository: userRepository;

  constructor() {
    this.userRepository = new userRepository();
    this.redis = redisServices;
    this.tokenService = new TokenService();
  }

  async profile(user: HydratedDocument<IUser>): Promise<any> {
    return user.toJSON();
  }

  async rotateToken(
    user: HydratedDocument<IUser>,
    { jti, iat, sub }: { jti: string; iat: number; sub: string },
    issuer: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const nowInMs = Date.now();
    const tokenExpiryInMs = (iat + ACCESS_TOKEN_EXPIRATION) * 1000;

    if (tokenExpiryInMs >= nowInMs + 30000) {
      throw new ConflictException("Token is not expired yet");
    }

    const refreshExpiry = iat + REFRESH_TOKEN_EXPIRATION;
    const currentTimestamp = Math.floor(nowInMs / 1000);
    const remainingTTL = refreshExpiry - currentTimestamp;

    await this.tokenService.createRevokeTokenKey({
      userId: sub,
      jti,
      ttl: remainingTTL > 0 ? remainingTTL : 1,
    });

    return await this.tokenService.createloginCredentials(user, issuer);
  }

  async logout(
    { flag }: { flag: LOGOUTENUM },
    user: HydratedDocument<IUser>,
    { jti, iat, sub }: { jti: string; iat: number; sub: string },
  ): Promise<number> {
    let status = 200;
    switch (flag) {
      case LOGOUTENUM.ALL:
        user.changeCredentialsTime = new Date();
        await user.save();
        const keys = await this.redis.allKeys(
          `${this.redis.revokeTokenKeyPrefix(sub)}`,
        );
        if (keys.length > 0) await this.redis.deleteKey(keys);
        break;
      default:
        const expiryDate = iat + REFRESH_TOKEN_EXPIRATION;
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

  // --- Password Reset Section ---

  async requestForgotPasswordOtp(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      filter: { email, provider: PROVIDERENUM.SYSTEM },
      options: { lean: true },
    });
    if (!user) throw new NotFoundExpetions("Account not found");

    const otp = createNumberOtp();
    const hashedOtp = await generateHash({ plainText: otp });

    await this.redis.set({
      key: `OTP:forgotPassword:${email}`,
      value: hashedOtp,
      ttl: 600,
    });

    // 3. إرسال الإيميل (تأكد من تمرير الـ OTP في محتوى الرسالة)
    await sendEmail({
      to: email,
      subject: emailEnum.forgot_Bassword,
      html: verifyEmailTemplate({
        code: otp,
        title: "Your Password Reset OTP",
      }),
    });
  }

  async resetPasswordWithCode(inputs: any): Promise<void> {
    const { email, otp, password } = inputs;
    const otpKey = `OTP:forgotPassword:${email}`;
    const hashedOtp = await this.redis.get(otpKey);

    if (!hashedOtp) throw new NotFoundExpetions("Expired or invalid OTP");

    const isOtpValid = await compareHash({
      plainText: otp,
      cipherText: hashedOtp,
    }); // تأكد من اسم البروبيرتي hashedPassword
    if (!isOtpValid) throw new ConflictException("Invalid OTP");

    const user = await this.userRepository.findOneAndUpdate({
      filter: { email, provider: PROVIDERENUM.SYSTEM },
      update: {
        $set: {
          password: await generateHash({ plainText: password }),
          changeCredentialsTime: new Date(),
        },
      },
      options: { new: true },
    });

    if (!user) throw new NotFoundExpetions("User not found");

    //delete all keys related to password reset and revoke tokens
    const prefix = this.redis.revokeTokenKeyPrefix(user._id.toString());
    const tokenKeys = await this.redis.allKeys(prefix);
    const keysToDelete = [...tokenKeys, otpKey];
    await this.redis.deleteKey(keysToDelete);
  }

  async requestForgotPasswordLink(
    email: string,
    issuer: string,
  ): Promise<string> {
    const user = await this.userRepository.findOne({
      filter: { email, provider: PROVIDERENUM.SYSTEM },
      options: { lean: true },
    });
    if (!user) throw new NotFoundExpetions("Account not found");

    const resetToken = crypto.randomUUID();
    const linkKey = `link:forgotPassword:${resetToken}`;

    await this.redis.set({ key: linkKey, value: email, ttl: 600 });
    // for postman
    // return `${issuer}/auth/reset-password-link?token=${resetToken}`;
    //  for email
    const link = `${issuer}/reset-password-link?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset Password Link",
      html: `<h1>Reset Your Password</h1><p>Click <a href="${link}" style="color: blue; font-weight: bold;font-size: 16px;">Click here</a> to reset your password.</p>`,
    });

    return link;
  }

  async resetPasswordWithLink(token: string, password: string): Promise<void> {
    const linkKey = `link:forgotPassword:${token}`;
    const email = await this.redis.get(linkKey);

    if (!email) throw new BadRequestExpetions("Invalid or expired link");

    const user = await this.userRepository.findOneAndUpdate({
      filter: { email, provider: PROVIDERENUM.SYSTEM },
      update: {
        $set: {
          password: await generateHash({ plainText: password }),
          changeCredentialsTime: new Date(),
        },
      },
      options: { new: true },
    });

    if (!user) throw new NotFoundExpetions("Account not found");

    await this.redis.deleteKey(linkKey);
    const prefix = this.redis.revokeTokenKeyPrefix(user._id.toString());
    const tokenKeys = await this.redis.allKeys(prefix);
    if (tokenKeys.length > 0) await this.redis.deleteKey(tokenKeys);
  }
}

export default new userService();
