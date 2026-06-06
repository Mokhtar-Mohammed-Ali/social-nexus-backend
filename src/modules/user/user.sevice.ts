import {
  BadRequestExpetions,
  NotFoundExpetions,
} from "./../../common/exptions/domain.exeptions"; // تأكد من spelling كلمة exceptions
import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import {
  ACCESS_TOKEN_EXPIRATION,
  // AWS_S3_BUCKET_NAME,
  REFRESH_TOKEN_EXPIRATION,
} from "../../config/config.service";
import {
  redisServices,
  Redisservices,
  s3Service,
  S3Service,
  sendEmail,
  TokenService,
  verifyEmailTemplate,
} from "../../common/services";
import { ConflictException } from "../../common/exptions";
import {
  emailEnum,
  LOGOUTENUM,
  MulterStorage,
  PROVIDERENUM,
  UploadsEnum,
} from "../../common/enums";
import { compareHash, generateHash } from "../../common/utils/security";
import { userRepository } from "../../DB";
import crypto from "crypto";
import { createNumberOtp } from "../../common/utils";
import { Types } from "mongoose";
import { DeleteResult } from "mongoose";
import dayjs from "dayjs";

export class UserService {
  private readonly redis: Redisservices;
  private readonly tokenService: TokenService;
  private readonly userRepository: userRepository;
  private readonly s3: S3Service;

  constructor() {
    this.userRepository = new userRepository();
    this.redis = redisServices;
    this.tokenService = new TokenService();
    this.s3 = s3Service;
  }

  // async profile(user: HydratedDocument<IUser>): Promise<any> {
  //   return user.toJSON();
  // }
  // with graphQL
   async profile(user: HydratedDocument<IUser>): Promise<IUser> {
//  await this.userRepository.findOne({

// options:{populate:[{path:"friends"}]}})as HydratedDocument<IUser>;
    return user.toJSON()
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

  // hard delete account we not use it in controller but we can use it in admin controller if we want to delete account permanently and we can use it in delete account function if we want to give user the option to choose between soft delete and hard delete
  async hardDeleteAccount(userId: Types.ObjectId): Promise<DeleteResult> {
    const account = await this.userRepository.deleteOne({
      filter: { _id: userId, force: true },
    });
    if (!account.deletedCount) throw new NotFoundExpetions("User not found");
    await this.s3.deleteFolderContent({
      prifix: `Users/${userId.toString()}`,
    });
    return account;
  }

  //soft delete account and cron job to delete account after 30 day and we can restore account before 30 day if user change his mind and we can use it in delete account function if we want to give user the option to choose between soft delete and hard delete
  async deleteAccount(userId: Types.ObjectId): Promise<any> {
    const user = await this.userRepository.findOneAndUpdate({
      filter: { _id: userId },
      update: {
        deletedAt: new Date(),
        scheduledForDeletionAt: dayjs().add(30, "day").toDate(),
        $unset: { restoredAt: 1 },
      },
      options: { new: true },
    });

    if (!user) throw new NotFoundExpetions("User not found");

    return user;
  }

  // restore account and cron job deleted
  async restoreAccount(userId: Types.ObjectId): Promise<any> {
    const user = await this.userRepository.findOneAndUpdate({
      filter: { _id: userId },
      update: {
        restoredAt: new Date(),
        $unset: { deletedAt: 1, scheduledForDeletionAt: 1 },
      },
      options: { new: true },
    });

    if (!user) throw new NotFoundExpetions("User not found");

    return user;
  }

  // profile image upload small and large file
  async profileImage(file: Express.Multer.File, user: HydratedDocument<IUser>) {
    // small file
    // user.profilePic=await this.s3.uploadAsset({
    //   file,
    //   path:`users/${user._id}/profile`,
    //   // Bucket: AWS_S3_BUCKET_NAME,
    //   storageApproache: MulterStorage.DISK,
    // });
    const oldImageKey = user.profilePic;

    //large file
    const { Key } = await this.s3.uploadLargeAsset({
      file,
      path: `users/${user._id}/profile`,
      // Bucket: AWS_S3_BUCKET_NAME,
      storageApproache: MulterStorage.DISK,
      // partSize: 5
    });
    if (oldImageKey) {
      await this.s3.deleteAsset({ Key: oldImageKey });
    }
    user.profilePic = Key as string;

    await user.save();
    return user.toJSON();
  }

  // upload profil image with presigned url
  async profileImagePresigned(
    {
      ContentType,
      originalname,
    }: { ContentType?: string; originalname: string },
    user: HydratedDocument<IUser>,
  ): Promise<{ user: IUser; url: string }> {
    // delete old image from s3 if exist and we can use it  in profile image and cover image small and large

    // const oldImageKey = user.profilePic;
    const { url } = await this.s3.PresignedUploadLink({
      ContentType,
      originalname,
      path: `users/${user._id}/profile`,
    });

    // user.profilePic = key as string;
    // await user.save();
    //  if (oldImageKey) {
    //   await this.s3.deleteAsset({ Key: oldImageKey });
    // }
    return { user, url };
  }

  // profile cover image upload

  async profileCoverImage(
    files: Express.Multer.File[],
    user: HydratedDocument<IUser>,
  ) {
    const oldCoverKeys = user.profilePicCover;
    //large file and we can use small file in cover image
    const urls = await this.s3.uploadAssets({
      files,
      path: `users/${user._id}/profile/cover`,
      // Bucket: AWS_S3_BUCKET_NAME,
      storageApproache: MulterStorage.DISK,
      uploadApproache: UploadsEnum.SMALL,

      // partSize: 5
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

export const userService = new UserService();
