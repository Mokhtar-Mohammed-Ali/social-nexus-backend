import mongoose, { Schema } from "mongoose";
import { ReactionValue } from "../../common/enums";
import { cascadeSoftDeletePlugin } from "../../common/pluggins";
import { IComment } from "../../common/interfaces/comment.interface";

const commentSchema = new Schema<IComment>(
  {
    attachments: [String],
    content: {
      type: String,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
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
    collection: "COMMENTS",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,

    autoIndex: true,
  },
);

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "commentId", 
});

commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });
commentSchema.index({ createdBy: 1, createdAt: -1 });

commentSchema.pre(["find", "findOne", "countDocuments"], function () {
  const query = this.getQuery();
  if (!query.force) {
    this.setQuery({ ...query, deletedAt: null });
  }
});

// 3. Middleware للتعامل مع الحذف (Soft Delete)
commentSchema.pre(
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
commentSchema.plugin(cascadeSoftDeletePlugin, []);

export const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
CommentModel.syncIndexes();
