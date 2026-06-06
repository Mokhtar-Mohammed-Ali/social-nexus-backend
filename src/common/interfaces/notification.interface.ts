import { Types } from "mongoose";
import {
  NotificationType,
} from "../enums/notification.enum";
import { NotificationReferenceModel } from "../enums/reference.enum";

export interface INotification {
  _id?: Types.ObjectId;

  title: string;
  body: string;

  sender: Types.ObjectId;
  receiver: Types.ObjectId;

  type: NotificationType;

  referenceId?: Types.ObjectId;
  referenceModel?: NotificationReferenceModel;

  isRead: boolean;
  readAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}