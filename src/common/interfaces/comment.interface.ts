import { IUser } from './user.interface';
import { Types } from "mongoose";

export interface IComment {
postId: Types.ObjectId |null; 
commentId: Types.ObjectId|null; 
content?: string;
createdBy: Types.ObjectId | Types.ObjectId[] | IUser ;
updatedBy?: Types.ObjectId[] | IUser;
attachments?: string[]; 
reactions?:Types.ObjectId[] | IUser[]; 
tags?:Types.ObjectId[] | IUser[];
deletedAt?:Date | null; 
restoredAt?:Date ; 
createdAt: Date;
updatedAt?: Date;
} 