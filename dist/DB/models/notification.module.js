"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_enum_1 = require("../../common/enums/notification.enum");
const reference_enum_1 = require("../../common/enums/reference.enum");
const notificationSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: Object.values(notification_enum_1.NotificationType),
        required: true,
    },
    referenceId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: false,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        required: false,
        enum: Object.values(reference_enum_1.NotificationReferenceModel),
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    collection: "NOTIFICATIONS",
});
notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ sender: 1 });
exports.NotificationModel = mongoose_1.default.models.Notification ||
    mongoose_1.default.model("Notification", notificationSchema);
