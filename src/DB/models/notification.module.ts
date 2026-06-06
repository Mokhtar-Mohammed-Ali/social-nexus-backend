import mongoose from "mongoose";
import { INotification } from "../../common/interfaces";
import { NotificationType } from "../../common/enums/notification.enum";
import { NotificationReferenceModel } from "../../common/enums/reference.enum";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

   referenceId: {
  type: mongoose.Schema.Types.ObjectId,
  required: false,
  refPath: 'referenceModel' 
},

referenceModel: {
  type: String,
  required: false,
  enum: Object.values(NotificationReferenceModel), 
},

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "NOTIFICATIONS",
  },
);

notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ sender: 1 });

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
