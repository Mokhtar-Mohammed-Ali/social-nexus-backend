"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const security_1 = require("../utils/security");
class SecurityService {
    constructor() { }
    generateHash = security_1.generateHash;
    generateEncryption = security_1.generateEncryption;
    generateDecryption = security_1.generateDecreption;
    compareHash = security_1.compareHash;
}
exports.SecurityService = SecurityService;
