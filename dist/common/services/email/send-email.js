"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_service_1 = require("../../../config/config.service");
const exptions_1 = require("../../exptions");
const sendEmail = async ({ to, cc, bcc, subject, attachments, html, }) => {
    if (!html?.length && !attachments?.length)
        throw new exptions_1.BadRequestExpetions("html content is required to send email");
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_service_1.EMAIL_USER,
            pass: config_service_1.EMAIL_APP_PASS,
        },
    });
    const info = await transporter.sendMail({
        from: `"Social Media App By Mokhtar Mohammed" <${config_service_1.EMAIL_USER}>`,
        to,
        cc,
        bcc,
        subject,
        attachments,
        html,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
