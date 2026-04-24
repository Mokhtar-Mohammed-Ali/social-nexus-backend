import { IUser } from "./../../common/interfaces/user.interface";
import {
  confirEmailDTO,
  IloginDto,
  IsignupDto,
  resendConfirEmailDTO,
} from "./auth.DTO";
import {
  BadRequestExpetions,
  ConflictException,
  NotFoundExpetions,
} from "../../common/exptions";
import { userRepository } from "../../DB";
import {
  compareHash,
  generateEncryption,
  generateHash,
} from "../../common/utils/security";
import {
  emailEvent,
  Redisservices,
  redisServices,
  sendEmail,
  TokenService,
  verifyEmailTemplate,
} from "../../common/services";
import { emailEnum, PROVIDERENUM } from "../../common/enums";
import { createNumberOtp } from "../../common/utils";
import { IloginResponse } from "./auth.entity";
import { WEB_CLIENT_ID } from "../../config/config.service";
import { OAuth2Client, TokenPayload } from "google-auth-library";

class AuthService {
  private readonly userRepository: userRepository;
  private readonly redis: Redisservices;
  private readonly tokenService: TokenService;
  // private readonly securityService: SecurityService
  constructor() {
    this.userRepository = new userRepository();
    // this.securityService = new SecurityService();
    this.redis = redisServices;
    this.tokenService = new TokenService();
  }

  //send otp
  private async senEmailOtp({
    email,
    subject,
    title,
  }: {
    email: string;
    subject: emailEnum;
    title: string;
  }) {
    const isBlocked = await this.redis.ttl(
      this.redis.blockAttemptOtpKey({ email, subject }),
    );
    if (isBlocked > 0) {
      throw new BadRequestExpetions(
        `you are blocked as you are reached the max trail try again after ${isBlocked} second`,
      );
    }
    const reminingOtpTTL = await this.redis.ttl(
      this.redis.otpKey({ email, subject }),
    );
    if (reminingOtpTTL > 0) {
      throw new BadRequestExpetions(
        `pleas wait until expired the old otp and try again after ${reminingOtpTTL} second`,
      );
    }

    const maxTrial = await this.redis.get(
      this.redis.maxAttemptOtpKey({ email, subject }),
    );
    if (maxTrial >= 3) {
      await this.redis.set({
        key: this.redis.blockAttemptOtpKey({ email, subject }),
        value: 1,
        ttl: 420,
      });
      throw new BadRequestExpetions(
        `sorry we cannot send another otp before ${isBlocked} second`,
      );
    }

    let code = createNumberOtp();
    await this.redis.set({
      key: this.redis.otpKey({ email, subject }),
      value: await generateHash({ plainText: `${code}` }),
      ttl: 120,
    });

    emailEvent.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject,
        html: verifyEmailTemplate({ code, title }),
      });
      await this.redis.icrement(
        this.redis.maxAttemptOtpKey({ email, subject }),
      );
    });
  }

  // confirm email

  public async confirmEmail({ email, otp }: confirEmailDTO) {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: false },
        provider: PROVIDERENUM.SYSTEM,
      },
    });

    if (!account) throw new NotFoundExpetions("faile to find matched account");
    const hashedOtp = await this.redis.get(this.redis.otpKey({ email }));
    if (!hashedOtp) {
      throw new NotFoundExpetions("expired otp");
    }
    if (!(await compareHash({ plainText: otp, cipherText: hashedOtp }))) {
      throw new ConflictException("invalid otp");
    }
    account.confirmEmail = new Date();
    await account.save();
    await this.redis.deleteKey(
      await this.redis.allKeys(
        this.redis.otpKey({ email, subject: emailEnum.confirm_Email }),
      ),
    );

    return;
  }

  // resend confirm email

  public async resendConfirmEmail({ email }: resendConfirEmailDTO) {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: false },
        provider: PROVIDERENUM.SYSTEM,
      },
    });

    if (!account) throw new NotFoundExpetions("faile to find matched account");
    await this.senEmailOtp({
      email,
      subject: emailEnum.confirm_Email,
      title: "resend confirm email",
    });
    return;
  }

  public async signUp({
    email,
    password,
    userName,
    phone,
  }: IsignupDto): Promise<IUser> {
    const userExist = await this.userRepository.findOne({
      filter: { email },
      projection: "email",
      options: { lean: true },
    });
    console.log({ userExist });
    if (userExist) {
      throw new ConflictException("User already exists");
    }
    const user = await this.userRepository.createOne({
      data: {
        email,
        password: await generateHash({ plainText: password }),
        // password: await this.securityService.generateHash({plainText:password}),
        userName,
        phone: phone ? await generateEncryption(phone) : undefined,
        // phone:phone? await this.securityService.generateEncryption(phone):undefined,
      },
    });
    if (!user) throw new BadRequestExpetions("User not created");
    // await sendEmail({

    //   to: email,
    //   subject: "Confirm Your Email",
    //   html: verifyEmailTemplate({
    //     code: 123456,
    //     title: `Welcome to Social Media App Thanks For Signing Up MR${userName}`,
    //   }),
    // });

    await this.senEmailOtp({
      email,
      subject: emailEnum.confirm_Email,
      title: "verify your account",
    });
    return user.toJSON();
  }

  // login with 2 step and block operation
  public async login(
    inputs: IloginDto,
    issuer: string,
  ): Promise<IloginResponse> {
    const { email, password } = inputs;

    const isBlockedSeconds = await this.redis.ttl(
      this.redis.loginBlockKey({ email }),
    );
    if (isBlockedSeconds > 0) {
      throw new BadRequestExpetions(
        `{Account blocked. Try again after ${Math.ceil(isBlockedSeconds / 60)} minutes.}`,
      );
    }

    const user = await this.userRepository.findOne({
      filter: { email, provider: PROVIDERENUM.SYSTEM },
    });

    if (!user || !user.confirmEmail) {
      // await handleFailedLogin(email);
      throw new NotFoundExpetions("Invalid email or password");
    }

    const isMatch = await compareHash({
      plainText: password,
      cipherText: user.password as string,
    });

    if (!isMatch) {
      // await handleFailedLogin(email);
      throw new NotFoundExpetions("Invalid email or password");
    }
    // very expensive operation because its delete many keys and its called in every login attempt
    // await this.redis.deleteKey(
    //   await this.redis.allKeys(this.redis.loginAttemptsKey({ email }))
    // );

    //not expensive operation because its delete one key
    await this.redis.deleteKey(this.redis.loginAttemptsKey({ email }));

    if (user.is2FA) {
      await this.senEmailOtp({
        email,
        subject: emailEnum.forgot_Bassword,
        title: "Login OTP",
      });
      // return { message: "2FA OTP sent to your email", secondStep: true };
    }
    // return await this.tokenService.sign({ payload: { sub: user._id } });
    return await this.tokenService.createloginCredentials(user, issuer);
  }

  // verify google account
  private async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestExpetions("Invalid Google ID token");
    }
    return payload;
  }

  // sign up with google
  async signupWithGmail(idToken: string, issuer: string) {
    console.log(idToken);
    const payload = await this.verifyGoogleAccount(idToken); //payloade
    console.log({ payload });
    const checkUserExist = await this.userRepository.findOne({
      filter: { email: payload.email as string },
    });
    if (checkUserExist) {
      if (checkUserExist.provider != PROVIDERENUM.GOOGLE) {
        throw new ConflictException(
          "email already exist with another provider",
        );
      }
      return {
        status: 200,
        credentials: await this.loginWithGmail(idToken, issuer),
      }; // login with google look ⬇⬇
    }
    const user = await this.userRepository.createOne({
      data: {
        firstName: payload.given_name as string,
        lastName: payload.family_name as string,
        email: payload.email as string,
        confirmEmail: new Date(),
        profilePic: payload.picture as string,
        provider: PROVIDERENUM.GOOGLE,
      },
    });
    return {
      status: 201,
      credentials: await this.tokenService.createloginCredentials(user, issuer),
    };
  }

  // login with google
  async loginWithGmail(idToken: string, issuer: string) {
    console.log(idToken);
    const payload = await this.verifyGoogleAccount(idToken); //payloade
    console.log({ payload });
    const user = await this.userRepository.findOne({
      filter: { email: payload.email as string, provider: PROVIDERENUM.GOOGLE },
    });

    if (!user) {
      throw new NotFoundExpetions("email not found, please sign up first");
    }
    return await this.tokenService.createloginCredentials(user, issuer);
  }
}
export default new AuthService();
