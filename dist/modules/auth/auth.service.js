"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exptions_1 = require("../../common/exptions");
const DB_1 = require("../../DB");
const security_1 = require("../../common/utils/security");
const services_1 = require("../../common/services");
const enums_1 = require("../../common/enums");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const google_auth_library_1 = require("google-auth-library");
const notification_repository_1 = require("../../DB/DataBaseRepository/notification.repository");
class AuthService {
    userRepository;
    notificationRepository;
    redis;
    tokenService;
    notificationService;
    constructor() {
        this.userRepository = new DB_1.userRepository();
        this.notificationRepository = new notification_repository_1.NotificationRepository();
        this.redis = services_1.redisServices;
        this.tokenService = new services_1.TokenService();
        this.notificationService = new services_1.NotificationService();
    }
    async senEmailOtp({ email, subject, title, }) {
        const isBlocked = await this.redis.ttl(this.redis.blockAttemptOtpKey({ email, subject }));
        if (isBlocked > 0) {
            throw new exptions_1.BadRequestExpetions(`you are blocked as you are reached the max trail try again after ${isBlocked} second`);
        }
        const reminingOtpTTL = await this.redis.ttl(this.redis.otpKey({ email, subject }));
        if (reminingOtpTTL > 0) {
            throw new exptions_1.BadRequestExpetions(`pleas wait until expired the old otp and try again after ${reminingOtpTTL} second`);
        }
        const maxTrial = await this.redis.get(this.redis.maxAttemptOtpKey({ email, subject }));
        if (maxTrial >= 3) {
            await this.redis.set({
                key: this.redis.blockAttemptOtpKey({ email, subject }),
                value: 1,
                ttl: 420,
            });
            throw new exptions_1.BadRequestExpetions(`sorry we cannot send another otp before ${isBlocked} second`);
        }
        let code = (0, utils_1.createNumberOtp)();
        await this.redis.set({
            key: this.redis.otpKey({ email, subject }),
            value: await (0, security_1.generateHash)({ plainText: `${code}` }),
            ttl: 120,
        });
        services_1.emailEvent.emit("sendEmail", async () => {
            await (0, services_1.sendEmail)({
                to: email,
                subject,
                html: (0, services_1.verifyEmailTemplate)({ code, title }),
            });
            await this.redis.icrement(this.redis.maxAttemptOtpKey({ email, subject }));
        });
    }
    async confirmEmail({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: enums_1.PROVIDERENUM.SYSTEM,
            },
        });
        if (!account)
            throw new exptions_1.NotFoundExpetions("faile to find matched account");
        const hashedOtp = await this.redis.get(this.redis.otpKey({ email }));
        if (!hashedOtp) {
            throw new exptions_1.NotFoundExpetions("expired otp");
        }
        if (!(await (0, security_1.compareHash)({ plainText: otp, cipherText: hashedOtp }))) {
            throw new exptions_1.ConflictException("invalid otp");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.redis.deleteKey(await this.redis.allKeys(this.redis.otpKey({ email, subject: enums_1.emailEnum.confirm_Email })));
        return;
    }
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: enums_1.PROVIDERENUM.SYSTEM,
            },
        });
        if (!account)
            throw new exptions_1.NotFoundExpetions("faile to find matched account");
        await this.senEmailOtp({
            email,
            subject: enums_1.emailEnum.confirm_Email,
            title: "resend confirm email",
        });
        return;
    }
    async signUp({ email, password, userName, phone, }) {
        const userExist = await this.userRepository.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true },
        });
        console.log({ userExist });
        if (userExist) {
            throw new exptions_1.ConflictException("User already exists");
        }
        const user = await this.userRepository.createOne({
            data: {
                email,
                password: await (0, security_1.generateHash)({ plainText: password }),
                userName,
                phone: phone ? await (0, security_1.generateEncryption)(phone) : undefined,
            },
        });
        if (!user)
            throw new exptions_1.BadRequestExpetions("User not created");
        await this.senEmailOtp({
            email,
            subject: enums_1.emailEnum.confirm_Email,
            title: "verify your account",
        });
        return user.toJSON();
    }
    async login(inputs, issuer) {
        const { email, password, Fcm } = inputs;
        const isBlockedSeconds = await this.redis.ttl(this.redis.loginBlockKey({ email }));
        if (isBlockedSeconds > 0) {
            throw new exptions_1.BadRequestExpetions(`{Account blocked. Try again after ${Math.ceil(isBlockedSeconds / 60)} minutes.}`);
        }
        const user = await this.userRepository.findOne({
            filter: { email, provider: enums_1.PROVIDERENUM.SYSTEM },
        });
        if (!user || !user.confirmEmail) {
            throw new exptions_1.NotFoundExpetions("Invalid email or password");
        }
        const isMatch = await (0, security_1.compareHash)({
            plainText: password,
            cipherText: user.password,
        });
        if (!isMatch) {
            throw new exptions_1.NotFoundExpetions("Invalid email or password");
        }
        await this.redis.deleteKey(this.redis.loginAttemptsKey({ email }));
        if (user.is2FA) {
            await this.senEmailOtp({
                email,
                subject: enums_1.emailEnum.forgot_Bassword,
                title: "Login OTP",
            });
        }
        if (Fcm) {
            await this.redis.addFCM(user._id, Fcm);
            const tokens = await this.redis.getFCMs(user._id);
            if (tokens.length) {
                await this.notificationService.sendNotifications({
                    tokens,
                    data: {
                        title: "Login Notification",
                        body: "You have successfully logged in to your account.",
                    },
                });
                await this.notificationRepository.create({
                    data: {
                        title: "Login Notification",
                        body: "You have successfully logged in to your account.",
                        sender: user._id,
                        receiver: user._id,
                        type: "SYSTEM",
                        isRead: false,
                    },
                });
            }
        }
        return await this.tokenService.createloginCredentials(user, issuer);
    }
    async verifyGoogleAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_service_1.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new exptions_1.BadRequestExpetions("Invalid Google ID token");
        }
        return payload;
    }
    async signupWithGmail(idToken, issuer) {
        console.log(idToken);
        const payload = await this.verifyGoogleAccount(idToken);
        console.log({ payload });
        const checkUserExist = await this.userRepository.findOne({
            filter: { email: payload.email },
        });
        if (checkUserExist) {
            if (checkUserExist.provider != enums_1.PROVIDERENUM.GOOGLE) {
                throw new exptions_1.ConflictException("email already exist with another provider");
            }
            return {
                status: 200,
                credentials: await this.loginWithGmail(idToken, issuer),
            };
        }
        const user = await this.userRepository.createOne({
            data: {
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                confirmEmail: new Date(),
                profilePic: payload.picture,
                provider: enums_1.PROVIDERENUM.GOOGLE,
            },
        });
        return {
            status: 201,
            credentials: await this.tokenService.createloginCredentials(user, issuer),
        };
    }
    async loginWithGmail(idToken, issuer) {
        console.log(idToken);
        const payload = await this.verifyGoogleAccount(idToken);
        console.log({ payload });
        const user = await this.userRepository.findOne({
            filter: { email: payload.email, provider: enums_1.PROVIDERENUM.GOOGLE },
        });
        if (!user) {
            throw new exptions_1.NotFoundExpetions("email not found, please sign up first");
        }
        return await this.tokenService.createloginCredentials(user, issuer);
    }
}
exports.default = new AuthService();
