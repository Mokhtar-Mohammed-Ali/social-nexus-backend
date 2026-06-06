import { availabilityEnum } from '../enums';
import { IUser } from './user.interface';
import { Types } from "mongoose";

export interface IPost {
folderId?: string;
content?: string;
createdBy: Types.ObjectId[] | IUser;
updatedBy?: Types.ObjectId[] | IUser;
attachments?: string[]; // Array of attachment URLs or IDs
reactions?:Types.ObjectId[] | IUser[]; // Array of user IDs who liked the post
tags?:Types.ObjectId[] | IUser[];
availability?: availabilityEnum; // Array of user IDs who can view the post
deletedAt?:Date | null; // Timestamp for soft deletion
restoredAt?:Date ; // Timestamp for restoration
createdAt: Date;
updatedAt?: Date;
} 