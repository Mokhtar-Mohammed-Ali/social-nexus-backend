import { redisServices, Redisservices } from './redis.services';
import { userRepository } from './../../DB/DataBaseRepository/user.repository';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, TOKEN_SECRET_SYSTEM_ACCESS, TOKEN_SECRET_SYSTEM_REFRESH, TOKEN_SECRET_USER_ACCESS, TOKEN_SECRET_USER_REFRESH } from '../../config/config.service';
import { ROLEENUM, TOKENTYPEENUM } from '../enums';
import { BadRequestExpetions, NotFoundExpetions, UnauthorizedExpetions } from '../exptions';
import { randomUUID } from 'node:crypto';
import { IUser } from '../interfaces';
import { HydratedDocument,  Types } from 'mongoose';

type signatures={ accessSignature: string, refreshSignature: string }
export class TokenService {
 private readonly userRepository: userRepository;
 private readonly redis: Redisservices;
    constructor() {
      this.userRepository = new userRepository();
      this.redis =  redisServices;
    }

     sign=async({payload, secret=TOKEN_SECRET_USER_ACCESS, options}:{

          payload: object,
            secret?: string,
            options?: SignOptions 
     }):Promise<string>=>{

        return jwt.sign(payload, secret, options)
     };

verify=async({token, secret=TOKEN_SECRET_USER_ACCESS}:{

token: string,
            secret?: string,
            options?:  SignOptions 
            
     }):Promise<JwtPayload>=>{

        return jwt.verify(token, secret) as JwtPayload
     };
   

     
//get token signature access or refresh
getSignature =async (
  tokenType = TOKENTYPEENUM.ACCESS,
signatureLevel: ROLEENUM,
):Promise<string> => {
  const signatures = await this. detectSignatureLevel(signatureLevel);
  let signature ;
  switch (tokenType) {
    case TOKENTYPEENUM.REFRESH:
      signature = signatures.refreshSignature;
      break;

    default:
      signature = signatures.accessSignature;
      break;
  }
  return signature;
};
// get token signature role System or User
detectSignatureLevel = async (role:ROLEENUM) :Promise<signatures>=> {
  let signature :signatures;
  switch (role) {
    case ROLEENUM.Admin:
      signature = {
        accessSignature: TOKEN_SECRET_SYSTEM_ACCESS ,
        refreshSignature: TOKEN_SECRET_SYSTEM_REFRESH ,
      };
      break;

    default:
      signature = {
        accessSignature: TOKEN_SECRET_USER_ACCESS,
        refreshSignature: TOKEN_SECRET_USER_REFRESH,
      };
      break;
  }
  return signature;
};
// decode token
 decodeToken = async ({token, tokenType=TOKENTYPEENUM.ACCESS}: { token: string, tokenType?: TOKENTYPEENUM }):Promise<{
   user:HydratedDocument<IUser>,
   decoded: JwtPayload
 }> => {
  const decoded = jwt.decode(token) as JwtPayload;
  console.log({ decoded });
  if (!decoded?.aud?.length)
    throw new BadRequestExpetions( "invalid token" );
  const [tokeApproatch, signatureLevel] = decoded.aud || [];

  
  console.log({ tokeApproatch, signatureLevel });

  if(tokenType===undefined || tokeApproatch===undefined)throw new BadRequestExpetions(
  "missing token type or invalid token aud",
    );
  if (tokenType !== tokeApproatch as unknown as TOKENTYPEENUM)
    throw new BadRequestExpetions(
   `invalid token type ${tokenType}❎ you must be ${tokeApproatch} ✅`,
    );
  if (
    decoded.jti &&
    (await this.redis.get(this.redis.revokeTokenKey({ userId: decoded.sub as string, jti: decoded.jti })))
  ) {
    throw new UnauthorizedExpetions( "invalid login session" );
  }

  const secret = await this.getSignature(
    tokeApproatch as unknown as TOKENTYPEENUM,
    signatureLevel as unknown as ROLEENUM,
  );
  const verifyedData = await this.verify({token, secret});
  console.log({ verifyedData });
  const user = await  this.userRepository.findOne({
    
    filter: { _id: verifyedData.sub },
  });
  if (!user) throw new NotFoundExpetions( "user not found" );
  console.log({
    credentialTime: user.changeCredentialsTime?.getTime(),
    iat: decoded.iat? decoded.iat * 1000 as number: undefined,
  });
//   if (
//     user.changeCredentialsTime &&
//     user.changeCredentialsTime?.getTime()  >= decoded.iat * 1000
//   )
const tokenTime = decoded.iat ? decoded.iat * 1000 : 0;

if (
  user.changeCredentialsTime &&
  user.changeCredentialsTime.getTime() >= tokenTime
) {
  throw new BadRequestExpetions("invalid login session");
}

  return { user, decoded };
};
// login and generate access and refresh token
 createloginCredentials = async (user: HydratedDocument<IUser>, issuer:string):Promise<{
   accessToken: string,
   refreshToken: string
 }> => {
  const jwtId = randomUUID();
  const { accessSignature, refreshSignature } =await this.detectSignatureLevel(
    user.role,
  );
  const accessToken = await this.sign({
    payload: { sub: user._id },
    secret: accessSignature,
    options: {
      expiresIn: ACCESS_TOKEN_EXPIRATION, // expire in 1 hour
      audience: [TOKENTYPEENUM.ACCESS as unknown as string, user.role as unknown as string], // who will use this token
      issuer: issuer, // who create this token
      algorithm: "HS256", // algorithm to encrypt the token
      jwtid: jwtId, // unique id for the token
      // notBefore: "1s", // not before 1 second
    },
  });

  
  const refreshToken = await this.sign ({
    payload: { sub: user._id },
    secret: refreshSignature,
    options: {
      expiresIn: REFRESH_TOKEN_EXPIRATION, // expire in 1 year
      audience: [TOKENTYPEENUM.REFRESH as unknown as string, user.role as unknown as string], // who will use this token
      issuer: issuer, // who create this token
      algorithm: "HS256", // algorithm to encrypt the token
      jwtid: jwtId, // unique id for the token
    },
  });
  
  return { accessToken, refreshToken };
};

// create revoke token key for redis
createRevokeTokenKey = async ({ userId, jti, ttl }: { userId: Types.ObjectId | string; jti: string;  ttl?: number }) => {
  try {
    await this.redis.set({
      key: this.redis.revokeTokenKey({ userId, jti }),
      value: jti,
      ttl
    });
  } catch (error) {
    console.error("Error creating revoke token key:", error);
  }
    };
    };



