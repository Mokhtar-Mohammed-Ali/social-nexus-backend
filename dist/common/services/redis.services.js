"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisServices = exports.Redisservices = void 0;
const config_service_1 = require("./../../config/config.service");
const redis_1 = require("redis");
const enums_1 = require("../enums");
class Redisservices {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: config_service_1.REDI_URI });
        this.handleEvent();
    }
    handleEvent() {
        this.client.on("error", (err) => {
            console.log("redis error ", err);
        });
        this.client.on("ready", () => {
            console.log("redis is ready");
        });
    }
    async connect() {
        await this.client.connect();
        console.log("redis connected successfully");
    }
    revokeTokenKeyPrefix = (userId) => {
        return `user:RevokeToken:${userId}`;
    };
    revokeTokenKey = ({ userId, jti, }) => {
        return `${this.revokeTokenKeyPrefix(userId)}:${jti}`;
    };
    otpKey = ({ email, subject = enums_1.emailEnum.confirm_Email }) => {
        return `OTP::user::${email}::${subject}`;
    };
    maxAttemptOtpKey = ({ email, subject = enums_1.emailEnum.confirm_Email, }) => {
        return `${this.otpKey({ email, subject })}::maxTraiel`;
    };
    blockAttemptOtpKey = ({ email, subject = enums_1.emailEnum.confirm_Email, }) => {
        return `${this.otpKey({ email, subject })}::block`;
    };
    loginBlockKey = ({ email }) => `Login::Block::${email}`;
    loginAttemptsKey = ({ email }) => `Login::Attempts::${email}`;
    set = async ({ key, value, ttl, }) => {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            if (ttl) {
                return await this.client.setEx(key, ttl, data);
            }
            else {
                return await this.client.set(key, data);
            }
        }
        catch (error) {
            console.error("Redis SET error:", error);
            return null;
        }
    };
    get = async (key) => {
        try {
            try {
                return JSON.parse((await this.client.get(key)));
            }
            catch (rerror) {
                return await this.client.get(key);
            }
        }
        catch (error) {
            console.error("Redis GET error:", error);
            return;
        }
    };
    mGet = async (keys) => {
        try {
            if (!keys.length)
                return [];
            return await this.client.mGet(keys);
        }
        catch (error) {
            console.log("Redis MGET error:", error);
            return [];
        }
    };
    update = async ({ key, value, ttl, }) => {
        try {
            const exists = await this.client.exists(key);
            if (!exists)
                return null;
            return await this.set({ key, value, ttl });
        }
        catch (error) {
            console.error("Redis UPDATE error:", error);
            return 0;
        }
    };
    exists = async (key) => {
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            console.log("error redis exist opration ");
            return -2;
        }
    };
    icrement = async (key) => {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.log("error redis incr opration ");
            return -2;
        }
    };
    deleteKey = async (key) => {
        try {
            if (!key.length)
                return 0;
            return await this.client.del(key);
        }
        catch (error) {
            console.error("Redis DELETE error:", error);
            return 0;
        }
    };
    expire = async ({ key, ttl, }) => {
        try {
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            console.error("Redis EXPIRE error:", error);
            return 0;
        }
    };
    ttl = async (key) => {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.error("Redis TTL error:", error);
            return -2;
        }
    };
    allKeys = async (prefix) => {
        try {
            return await this.client.keys(`${prefix}*`);
        }
        catch (error) {
            console.error("Redis ALLKEYS error:", error);
            return [];
        }
    };
    Fcm_key(userId) {
        return `user:FCM:${userId.toString()}`;
    }
    async addFCM(userId, FCMToken) {
        return await this.client.sAdd(this.Fcm_key(userId), FCMToken);
    }
    async removeFCM(userId, FCMToken) {
        return await this.client.sRem(this.Fcm_key(userId), FCMToken);
    }
    async getFCMs(userId) {
        return await this.client.sMembers(this.Fcm_key(userId));
    }
    async hasFCMs(userId) {
        return await this.client.sCard(this.Fcm_key(userId));
    }
    async removeFCMUser(userId) {
        return await this.client.del(this.Fcm_key(userId));
    }
}
exports.Redisservices = Redisservices;
exports.redisServices = new Redisservices();
