import { Request } from "express";
import { FileFilterCallback } from "multer";
import { BadRequestExpetions } from "../../exptions";

export const fileFieldValidation={
    image:["image/jpeg","image/png","image/gif"],
    video:["video/mp4","video/mpeg","video/quicktime"],
    audio:["audio/mpeg","audio/wav","audio/ogg"],
}
export const fileFilter = (validation :string[]) => {
  return function (req:Request, file:Express.Multer.File, cb:FileFilterCallback) {
    {
      if (!validation.includes(file.mimetype as unknown as string)) {
        return cb(
          new BadRequestExpetions("invalid file format")
        );
      }
      cb(null, true);
    }
  };
};
