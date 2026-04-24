"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const services_1 = require("../common/services");
const enums_1 = require("../common/enums");
const exptions_1 = require("../common/exptions");
const authentication = (tokenType = enums_1.TOKENTYPEENUM.ACCESS) => {
    return async (req, res, next) => {
        const tokenService = new services_1.TokenService();
        const [key, credential] = req.headers?.authorization?.split(" ") || [];
        console.log({ key, credential });
        if (!key || !credential) {
            throw new exptions_1.UnauthorizedExpetions("Missing authorization");
        }
        switch (key) {
            case "Basic":
                break;
            default:
                const { user, decoded } = await tokenService.decodeToken({
                    token: credential,
                    tokenType,
                });
                req.user = user;
                req.decoded = decoded;
                break;
        }
        next();
    };
};
exports.authentication = authentication;
