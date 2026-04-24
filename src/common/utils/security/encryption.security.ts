
import crypto from 'crypto';
import { ENCRYPTION_SECRET_BITE } from '../../../config/config.service';
import { BadRequestExpetions } from '../../exptions';
const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = Buffer.from(ENCRYPTION_SECRET_BITE);//must be 32

export const generateEncryption =async (plainText: string) :Promise<string> => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipherIvVector = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);

  let cipherText = cipherIvVector.update(plainText, 'utf-8', 'hex');
  cipherText += cipherIvVector.final('hex');

  return `${iv.toString('hex')}:${cipherText}`;
}

export const generateDecreption = async(cipherText: string): Promise<string> => {
  const [iv, encryption] = cipherText.split(":") as string[] || []; // []
if (!iv || !encryption) {
    throw new BadRequestExpetions('Invalid cipher text format');
  }
  const ivLikeBinary = Buffer.from(iv, 'hex');
  console.log({iv,ivLikeBinary,encryption});

  const decipherIvVector = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, ivLikeBinary);

  let plainText = decipherIvVector.update(encryption, 'hex', 'utf8');
  plainText += decipherIvVector.final('utf8');

  return plainText;
}