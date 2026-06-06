import mongoose, { Schema } from "mongoose";
import { IPost } from "../../common/interfaces";
import { availabilityEnum, ReactionValue } from "../../common/enums";
import { cascadeSoftDeletePlugin } from "../../common/pluggins";

const postSchema = new Schema<IPost>(
  {
    folderId: String,
    attachments: [String],
    content: {
      type: String,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    availability: {
      type: Number,
      enum: availabilityEnum,
      default: availabilityEnum.PUBLIC,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

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
  },
  {
    timestamps: true,
    collection: "POSTS",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,

    autoIndex: true,
  },
);

postSchema.index({ createdBy: 1, createdAt: -1 });

// 2. Middleware للفلترة التلقائية للمحذوفات (Soft Delete Query Hook)
postSchema.pre(["find", "findOne", "countDocuments"], function () {
  const query = this.getQuery();
  if (!query.force) {
    this.setQuery({ ...query,  deletedAt: null});
  }
});

// 3. Middleware للتعامل مع الحذف (Soft Delete)
postSchema.pre(["deleteOne","countDocuments", "findOneAndDelete"], function () {
  const query = this.getQuery();
  if (query.force) {
    this.setQuery({ ...query });
  } else {
    this.setUpdate({ $set: { deletedAt: new Date() } });
  }
});

// 4. تفعيل البلاجن (للتعامل مع الحذف التسلسلي من الموديلات الأخرى أو للمستخدم)
postSchema.plugin(cascadeSoftDeletePlugin, []);

export const PostModel =
  mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
