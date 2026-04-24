"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const redis_services_1 = require("./redis.services");
const user_repository_1 = require("./../../DB/DataBaseRepository/user.repository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_service_1 = require("../../config/config.service");
const enums_1 = require("../enums");
const exptions_1 = require("../exptions");
const node_crypto_1 = require("node:crypto");
class TokenService {
    userRepository;
    redis;
    constructor() {
        this.userRepository = new user_repository_1.userRepository();
        this.redis = redis_services_1.redisServices;
    }
    sign = async ({ payload, secret = config_service_1.TOKEN_SECRET_USER_ACCESS, options }) => {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    };
    verify = async ({ token, secret = config_service_1.TOKEN_SECRET_USER_ACCESS }) => {
        return jsonwebtoken_1.default.verify(token, secret);
    };
    getSignature = async (tokenType = enums_1.TOKENTYPEENUM.ACCESS, signatureLevel) => {
        const signatures = await this.detectSignatureLevel(signatureLevel);
        let signature;
        switch (tokenType) {
            case enums_1.TOKENTYPEENUM.REFRESH:
                signature = signatures.refreshSignature;
                break;
            default:
                signature = signatures.accessSignature;
                break;
        }
        return signature;
    };
    detectSignatureLevel = async (role) => {
        let signature;
        switch (role) {
            case enums_1.ROLEENUM.Admin:
                signature = {
                    accessSignature: config_service_1.TOKEN_SECRET_SYSTEM_ACCESS,
                    refreshSignature: config_service_1.TOKEN_SECRET_SYSTEM_REFRESH,
                };
                break;
            default:
                signature = {
                    accessSignature: config_service_1.TOKEN_SECRET_USER_ACCESS,
                    refreshSignature: config_service_1.TOKEN_SECRET_USER_REFRESH,
                };
                break;
        }
        return signature;
    };
    decodeToken = async ({ token, tokenType = enums_1.TOKENTYPEENUM.ACCESS }) => {
        const decoded = jsonwebtoken_1.default.decode(token);
        console.log({ decoded });
        if (!decoded?.aud?.length)
            throw new exptions_1.BadRequestExpetions("invalid token");
        const [tokeApproatch, signatureLevel] = decoded.aud || [];
        console.log({ tokeApproatch, signatureLevel });
        if (tokenType === undefined || tokeApproatch === undefined)
            throw new exptions_1.BadRequestExpetions("missing token type or invalid token aud");
        if (tokenType !== tokeApproatch)
            throw new exptions_1.BadRequestExpetions(`invalid token type ${tokenType}❎ you must be ${tokeApproatch} ✅`);
        if (decoded.jti &&
            (await this.redis.get(this.redis.revokeTokenKey({ userId: decoded.sub, jti: decoded.jti })))) {
            throw new exptions_1.UnauthorizedExpetions("invalid login session");
        }
        const secret = await this.getSignature(tokeApproatch, signatureLevel);
        const verifyedData = await this.verify({ token, secret });
        console.log({ verifyedData });
        const user = await this.userRepository.findOne({
            filter: { _id: verifyedData.sub },
        });
        if (!user)
            throw new exptions_1.NotFoundExpetions("user not found");
        console.log({
            credentialTime: user.changeCredentialsTime?.getTime(),
            iat: decoded.iat ? decoded.iat * 1000 : undefined,
        });
        const tokenTime = decoded.iat ? decoded.iat * 1000 : 0;
        if (user.changeCredentialsTime &&
            user.changeCredentialsTime.getTime() >= tokenTime) {
            throw new exptions_1.BadRequestExpetions("invalid login session");
        }
        return { user, decoded };
    };
    createloginCredentials = async (user, issuer) => {
        const jwtId = (0, node_crypto_1.randomUUID)();
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(user.role);
        const accessToken = await this.sign({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                expiresIn: config_service_1.ACCESS_TOKEN_EXPIRATION,
                audience: [enums_1.TOKENTYPEENUM.ACCESS, user.role],
                issuer: issuer,
                algorithm: "HS256",
                jwtid: jwtId,
            },
        });
        const refreshToken = await this.sign({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                expiresIn: config_service_1.REFRESH_TOKEN_EXPIRATION,
                audience: [enums_1.TOKENTYPEENUM.REFRESH, user.role],
                issuer: issuer,
                algorithm: "HS256",
                jwtid: jwtId,
            },
        });
        return { accessToken, refreshToken };
    };
    createRevokeTokenKey = async ({ userId, jti, ttl }) => {
        try {
            await this.redis.set({
                key: this.redis.revokeTokenKey({ userId, jti }),
                value: jti,
                ttl
            });
        }
        catch (error) {
            console.error("Error creating revoke token key:", error);
        }
    };
}
exports.TokenService = TokenService;
;
