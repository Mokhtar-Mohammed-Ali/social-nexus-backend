import { GENDERENUM, PROVIDERENUM, ROLEENUM } from "../enums";

export interface IUser {
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  DOB?: Date;
  confirmEmail?: Date;
  changeCredentialsTime?: Date;
  password?: string;
  oldPassword?: string[];
  phone?: string;
  profilePicCover?: string[];
  profilePic?: string;
  profileGallery?: string[];
  provider: PROVIDERENUM;
  role: ROLEENUM;
  visitCount: number;
  is2FA: boolean;
  gender: GENDERENUM;
  createdAt: Date;
  updatedAt: Date;
}
