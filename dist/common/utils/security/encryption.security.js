"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecreption = exports.generateEncryption = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_service_1 = require("../../../config/config.service");
const exptions_1 = require("../../exptions");
const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = Buffer.from(config_service_1.ENCRYPTION_SECRET_BITE);
const generateEncryption = async (plainText) => {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipherIvVector = crypto_1.default.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);
    let cipherText = cipherIvVector.update(plainText, 'utf-8', 'hex');
    cipherText += cipherIvVector.final('hex');
    return `${iv.toString('hex')}:${cipherText}`;
};
exports.generateEncryption = generateEncryption;
const generateDecreption = async (cipherText) => {
    const [iv, encryption] = cipherText.split(":") || [];
    if (!iv || !encryption) {
        throw new exptions_1.BadRequestExpetions('Invalid cipher text format');
    }
    const ivLikeBinary = Buffer.from(iv, 'hex');
    console.log({ iv, ivLikeBinary, encryption });
    const decipherIvVector = crypto_1.default.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, ivLikeBinary);
    let plainText = decipherIvVector.update(encryption, 'hex', 'utf8');
    plainText += decipherIvVector.final('utf8');
    return plainText;
};
exports.generateDecreption = generateDecreption;
