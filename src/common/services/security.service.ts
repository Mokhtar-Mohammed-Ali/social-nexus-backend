import {
  compareHash,
  generateDecreption,
  generateEncryption,
  generateHash,
} from "../utils/security";

export class SecurityService {
  constructor() {}
  generateHash = generateHash;
  generateEncryption = generateEncryption;
  generateDecryption = generateDecreption;
  compareHash = compareHash;
}
// export default new SecurityService()
