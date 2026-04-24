import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.service";

export const generateHash = async ({
  plainText,
  salt = SALT_ROUND,
}: {
  plainText: string|number;
  salt?: number;
}): Promise<string|number> => {
  // const generatedSalt = await genSalt(salt,minor)
  const dataToHash = String(plainText); 

  return await hash(dataToHash, salt);
};

export const compareHash = async ({
  plainText,
  cipherText,
}: {
  plainText: string;
  cipherText: string;
}): Promise<boolean> => {
  return await compare(plainText, cipherText);
};
