import mongoose, { Schema, Types } from "mongoose";
import { ChatEnum, ReactionValue } from "../../common/enums";
import { cascadeSoftDeletePlugin } from "../../common/pluggins";
import { IChat, Imessage } from "../../common/interfaces/chat.interface";
const messageSchema = new Schema<Imessage>({
  attachments: { type: [String] },
  content: {
    type: String,
    required: function (this) {
      return !this.attachments?.length;
    },
  },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

  reactions: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      type: {
        type: String,
        enum: Object.values(ReactionValue),
        required: true,
      },
    },
  ],
  tags: [{ type: Schema.Types.ObjectId, ref: "User" }],

  deletedAt: { type: Date, default: null },
  restoredAt: Date,
}, {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,

    autoIndex: true,
  },);
const chatSchema = new Schema<IChat>(
  {
    messages: { type: [messageSchema], required: true },
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ChatEnum, default: ChatEnum.ovo },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },

    //ovm
    group: {
      type: String,
      required: function (this) {
        return this.type == ChatEnum.ovm;
      },
    },

    roomId: {
      type: String,
      required: function (this) {
        return this.type == ChatEnum.ovm;
      },
    },

    group_image: { type: String },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
  },

  {
    timestamps: true,
    collection: "SOCIAL_APP_CHAT",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,

    autoIndex: true,
  },
);

chatSchema.index({ createdBy: 1, createdAt: -1 });

// 2. Middleware للفلترة التلقائية للمحذوفات (Soft Delete Query Hook)
chatSchema.pre(["find", "findOne", "countDocuments"], function () {
  const query = this.getQuery();
  if (!query.force) {
    this.setQuery({ ...query, deletedAt: null });
  }
});

// 3. Middleware للتعامل مع الحذف (Soft Delete)
chatSchema.pre(
  ["deleteOne", "countDocuments", "findOneAndDelete"],
  function () {
    const query = this.getQuery();
    if (query.force) {
      this.setQuery({ ...query });
    } else {
      this.setUpdate({ $set: { deletedAt: new Date() } });
    }
  },
);

// 4. تفعيل البلاجن (للتعامل مع الحذف التسلسلي من الموديلات الأخرى أو للمستخدم)
chatSchema.plugin(cascadeSoftDeletePlugin, []);

export const ChatModel =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
