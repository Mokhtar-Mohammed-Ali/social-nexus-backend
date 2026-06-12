import { availabilityEnum, ChatEnum } from '../enums';
import { IUser } from './user.interface';
import { Types } from "mongoose";
export interface Imessage{
    createdBy: Types.ObjectId[] | IUser;

attachments?: string[]; // Array of attachment URLs or IDs
reactions?:Types.ObjectId[] | IUser[]; // Array of user IDs who liked the post
tags?:Types.ObjectId[] | IUser[];
availability?: availabilityEnum;
content?: string;
deletedAt?:Date | null; // Timestamp for soft deletion
restoredAt?:Date ; // Timestamp for restoration
createdAt: Date;
updatedAt?: Date;
}
export interface IChat {
    participants:Types.ObjectId[]|IUser[];
    messages:Imessage[];
type:ChatEnum;
createdBy: Types.ObjectId[] | IUser;
updatedBy?: Types.ObjectId[] | IUser;

//ovm
group:string;
group_image:string;
roomId:string;
deletedAt?:Date | null; // Timestamp for soft deletion
restoredAt?:Date ; // Timestamp for restoration
createdAt: Date;
updatedAt?: Date;
} 