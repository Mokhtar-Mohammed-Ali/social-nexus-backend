import type { Request } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { MulterStorage } from "../../enums";
import { fileFilter } from './validation.multer';
export const cloudeFileUploade = ({
storageApproache=MulterStorage.MEMORY,
validation=[],
maxSize=2 
}:{
storageApproache?:MulterStorage,
validation?:string[],
maxSize?:number
}) => {
 const storage= storageApproache == MulterStorage.MEMORY
    ? multer.memoryStorage()
    :   multer.diskStorage({
    destination: function (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, distenation: string) => void,
    ) {
      callback(null, tmpdir());
    },
    filename: function (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, distenation: string) => void,
    ) {
      cb(null, `${randomUUID()}-${file.originalname}`);
    },
  });
  return multer({ fileFilter: fileFilter(validation), storage, limits: { fileSize:  maxSize * 1024 * 1024} });
};
