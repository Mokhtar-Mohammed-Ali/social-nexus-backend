"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
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
