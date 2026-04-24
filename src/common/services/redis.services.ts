import { REDI_URI } from "./../../config/config.service";
// import { redisClient, updateOne } from "../../DB/index.js";
// import { emailEnum } from "../enums/email.enums.js";

import { createClient } from "redis";
import { RedisClientType } from "@redis/client";
import { emailEnum } from "../enums";
import { Types } from "mongoose";

type redisKeyTypes = {
  email: string;
  subject?: emailEnum;
};
export class Redisservices {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({ url: REDI_URI });
    this.handleEvent();
  }

  private handleEvent() {
    this.client.on("error", (err) => {
      console.log("redis error ", err);
    });

    this.client.on("ready", () => {
      console.log("redis is ready");
    });
  }

  public async connect() {
    await this.client.connect();
    console.log("redis connected successfully");
  }

  //REVOKE_TOKEN
  revokeTokenKeyPrefix = (userId: Types.ObjectId | string) => {
    return `user:RevokeToken:${userId}`;
  };

  revokeTokenKey = ({
    userId,
    jti,
  }: {
    userId: Types.ObjectId | string;
    jti: string;
  }) => {
    return `${this.revokeTokenKeyPrefix(userId)}:${jti}`;
  };
  //otp key
  otpKey = ({ email, subject = emailEnum.confirm_Email }: redisKeyTypes) => {
    return `OTP::user::${email}::${subject}`;
  };
  // max otp
  maxAttemptOtpKey = ({
    email,
    subject = emailEnum.confirm_Email,
  }: redisKeyTypes) => {
    return `${this.otpKey({ email, subject })}::maxTraiel`;
  };
  //block
  blockAttemptOtpKey = ({
    email,
    subject = emailEnum.confirm_Email,
  }: redisKeyTypes) => {
    return `${this.otpKey({ email, subject })}::block`;
  };

  // // block after 5

  loginBlockKey = ({ email }: { email: string }) => `Login::Block::${email}`;
  loginAttemptsKey = ({ email }: { email: string }) => `Login::Attempts::${email}`;
  // //one time link
  // forgotPasswordLinkKey = ({ token }) => `ForgotPwd::Link::${token}`;

  set = async ({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number | undefined;
  }): Promise<string | null> => {
    try {
      const data = typeof value === "string" ? value : JSON.stringify(value);

      if (ttl) {
        // ttl by seconds
        return await this.client.setEx(key, ttl, data);
      } else {
        return await this.client.set(key, data);
      }
    } catch (error) {
      console.error("Redis SET error:", error);
      return null;
    }
  };

  get = async (key: string): Promise<any> => {
    try {
      try {
        return JSON.parse((await this.client.get(key)) as string);
      } catch (rerror) {
        return await this.client.get(key);
      }
    } catch (error) {
      console.error("Redis GET error:", error);
      return;
    }
  };

  mGet = async (keys: string[]): Promise<any[]> => {
    try {
      if (!keys.length) return [];
      return await this.client.mGet(keys)as string[];
    } catch (error) {
      console.log("Redis MGET error:", error);
      return [];
    }
  };
  update = async ({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number | undefined;
  }): Promise<string | null | number> => {
    try {
      const exists = await this.client.exists(key);
      if (!exists) return null;
      return await this.set({ key, value, ttl });
    } catch (error) {
      console.error("Redis UPDATE error:", error);
      return 0;
    }
  };

  exists = async (key: string): Promise<number> => {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.log("error redis exist opration ");
      return -2;
    }
  };

  icrement = async (key: string): Promise<number> => {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.log("error redis incr opration ");
      return -2;
    }
  };

  deleteKey = async (key: string | string[]): Promise<number> => {
    try {
      if (!key.length) return 0;
      return await this.client.del(key);
    } catch (error) {
      console.error("Redis DELETE error:", error);
      return 0;
    }
  };

  expire = async ({
    key,
    ttl,
  }: {
    key: string;
    ttl: number;
  }): Promise<number> => {
    try {
      return await this.client.expire(key, ttl);
    } catch (error) {
      console.error("Redis EXPIRE error:", error);
      return 0;
    }
  };

  ttl = async (key: string): Promise<number> => {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error);
      return -2;
    }
  };

  allKeys = async (prefix: string): Promise<string[]> => {
    try {
      return await this.client.keys(`${prefix}*`);
    } catch (error) {
      console.error("Redis ALLKEYS error:", error);
      return [];
    }
  };

  // logout = async (inputs) => {
  //   const { flag, decoded, FCMToken } = inputs;
  //   let status = 200;
  //   switch (flag) {
  //     case LogoutEnum.All:
  //       await updateOne({
  //         model: UserModel,
  //         filter: { _id: decoded?._id },
  //         update: {
  //           changeCredentialsTime: new Date(),
  //         },
  //       });

  //       await Promise.allSettled([
  //         removeUser(decoded?._id),
  //         removeFCMUser(decoded?._id),
  //         deleteKey(
  //           await allKeysByPrefix(revokeTokenKeyPrefix(`${decoded?._id}`)),
  //         ),
  //       ]);

  //       break;
  //     default:
  //       await createRevokeToken(decoded);
  //       if (FCMToken) {
  //         await removeFCM(decoded._id, FCMToken);
  //       }
  //       status = 201;
  //       break;
  //   }
  //   return status;
  // };
}
export const redisServices = new Redisservices();
