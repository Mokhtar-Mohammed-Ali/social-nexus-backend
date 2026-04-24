"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOW_ORIGINS = exports.Instagram_LINK = exports.Facebook_LINK = exports.Twitter_LINK = exports.WEB_CLIENT_ID = exports.REFRESH_TOKEN_EXPIRATION = exports.ACCESS_TOKEN_EXPIRATION = exports.TOKEN_SECRET_SYSTEM_REFRESH = exports.TOKEN_SECRET_USER_REFRESH = exports.TOKEN_SECRET_SYSTEM_ACCESS = exports.TOKEN_SECRET_USER_ACCESS = exports.EMAIL_APP_PASS = exports.EMAIL_USER = exports.ENCRYPTION_SECRET_BITE = exports.SALT_ROUND = exports.REDI_URI = exports.DB_URI = exports.BAS_URL = exports.port = void 0;
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(`./.env.${process.env.NODE_ENV}`) });
exports.port = process.env.PORT || 8000;
exports.BAS_URL = process.env.BAS_URL;
exports.DB_URI = process.env.DB_URI;
exports.REDI_URI = process.env.REDI_URI;
exports.SALT_ROUND = parseInt(process.env.SALT_ROUND ?? "10");
exports.ENCRYPTION_SECRET_BITE = process.env.ENCRYPTION_SECRET_BITE;
exports.EMAIL_USER = process.env.EMAIL_USER;
exports.EMAIL_APP_PASS = process.env.EMAIL_APP_PASS;
exports.TOKEN_SECRET_USER_ACCESS = process.env
    .TOKEN_SECRET_USER_ACCESS;
exports.TOKEN_SECRET_SYSTEM_ACCESS = process.env
    .TOKEN_SECRET_SYSTEM_ACCESS;
exports.TOKEN_SECRET_USER_REFRESH = process.env
    .TOKEN_SECRET_USER_REFRESH;
exports.TOKEN_SECRET_SYSTEM_REFRESH = process.env
    .TOKEN_SECRET_SYSTEM_REFRESH;
exports.ACCESS_TOKEN_EXPIRATION = parseInt(process.env.ACCESS_TOKEN_EXPIRATION ?? "1800");
exports.REFRESH_TOKEN_EXPIRATION = parseInt(process.env.REFRESH_TOKEN_EXPIRATION ?? "31536000");
exports.WEB_CLIENT_ID = process.env.WEB_CLIENT_ID;
exports.Twitter_LINK = process.env.Twitter_LINK;
exports.Facebook_LINK = process.env.Facebook_LINK;
exports.Instagram_LINK = process.env.Instagram_LINK;
exports.ALLOW_ORIGINS = process.env.ALLOW_ORIGINS?.split(',') || [];
console.log({ SALT_ROUND: exports.SALT_ROUND });
