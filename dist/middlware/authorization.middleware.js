"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQlAuthorization = exports.authorization = void 0;
const exptions_1 = require("../common/exptions");
const authorization = (AccessRoles) => {
    return async (req, res, next) => {
        if (!AccessRoles.includes(req.user.role)) {
            throw new exptions_1.ForbiddenExpetions("you don't have access to this resource");
        }
        return next();
    };
};
exports.authorization = authorization;
const GQlAuthorization = async (AccessRoles, user) => {
    if (!AccessRoles.includes(user.role)) {
        throw (0, exptions_1.mapGeaphQLError)(new exptions_1.ForbiddenExpetions("you don't have access to this resource"));
    }
    return true;
};
exports.GQlAuthorization = GQlAuthorization;
