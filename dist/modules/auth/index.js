"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.authRouter = void 0;
var auth_controller_js_1 = require("./auth.controller.js");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return __importDefault(auth_controller_js_1).default; } });
var auth_service_js_1 = require("./auth.service.js");
Object.defineProperty(exports, "authService", { enumerable: true, get: function () { return __importDefault(auth_service_js_1).default; } });
