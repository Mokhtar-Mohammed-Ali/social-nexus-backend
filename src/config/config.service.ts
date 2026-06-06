import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(`./.env.${process.env.NODE_ENV}`) });


export const APPLICATION_NAME=process.env.APPLICATION_NAME as string;
export const port = process.env.PORT || 8000;
export const BAS_URL = process.env.BAS_URL as string;

export const DB_URI = process.env.DB_URI as string;
export const REDI_URI = process.env.REDI_URI as string;

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? "10");
export const ENCRYPTION_SECRET_BITE = process.env.ENCRYPTION_SECRET_BITE as string;
export const EMAIL_USER = process.env.EMAIL_USER as string;
export const EMAIL_APP_PASS = process.env.EMAIL_APP_PASS as string;
export const TOKEN_SECRET_USER_ACCESS = process.env
  .TOKEN_SECRET_USER_ACCESS as string;
export const TOKEN_SECRET_SYSTEM_ACCESS = process.env
  .TOKEN_SECRET_SYSTEM_ACCESS as string;
export const TOKEN_SECRET_USER_REFRESH = process.env
  .TOKEN_SECRET_USER_REFRESH as string;
export const TOKEN_SECRET_SYSTEM_REFRESH = process.env
  .TOKEN_SECRET_SYSTEM_REFRESH as string;
export const ACCESS_TOKEN_EXPIRATION = parseInt(
  process.env.ACCESS_TOKEN_EXPIRATION ?? "1800"
) 
export const REFRESH_TOKEN_EXPIRATION = parseInt(
  process.env.REFRESH_TOKEN_EXPIRATION ?? "31536000"
) 
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID as string;
// links template
export const Twitter_LINK = process.env.Twitter_LINK as string;
export const Facebook_LINK = process.env.Facebook_LINK as string;
export const Instagram_LINK = process.env.Instagram_LINK as string;
//origins
export const ALLOW_ORIGINS = process.env.ALLOW_ORIGINS ?.split(',') || [] as string[];
console.log({ SALT_ROUND });

//AWS config
export const AWS_REGION = process.env.AWS_REGION as string;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;
export const AWS_EXPIRATION_TIME = parseInt(process.env.AWS_EXPIRATION_TIME ?? "120");

