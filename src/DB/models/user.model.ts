import { sendEmail } from "./../../common/services/email/send-email";

import mongoose, { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import { GENDERENUM, PROVIDERENUM, ROLEENUM } from "../../common/enums";
import { generateEncryption, generateHash } from "../../common/utils/security";
import { cascadeSoftDeletePlugin } from "../../common/pluggins";
import { Types } from "mongoose";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "first name must be at least 3 characters"],
      maxLength: [20, "first name must be less than 20 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [3, "last name must be at least 3 characters"],
      maxLength: [20, "last name must be less than 20 characters"],
      trim: true,
    },
    //  slug:{type:String,required:true},
    email: {
      type: String, // required: true,
      unique: true,
    },
    confirmEmail: { type: Date },
    changeCredentialsTime: { type: Date },
    gender: {
      type: Number,
      enum: GENDERENUM,
      default: GENDERENUM.Male,
    },
    password: {
      type: String,
      required: function (): boolean {
        return this.provider == PROVIDERENUM.SYSTEM;
      },

    },
    oldPassword: { type: [String] },
    // isModified: { type: Boolean, default: false },
    // phone: { type: String, required: true },
    phone: {
      type: String,
      required: function (): boolean {
        return this.provider == PROVIDERENUM.SYSTEM;
      },


    },

    friends:[{type:Types.ObjectId, ref:"User"}],
    profilePicCover: { type: [String] },
    profilePic: { type: String },
    profileGallery: { type: [String] },
    provider: {
      type: Number,
      enum: PROVIDERENUM,
      default: PROVIDERENUM.SYSTEM,
    },
    
    role: {
      type: Number,
      enum: ROLEENUM,
      default: ROLEENUM.User,
    },
    visitCount: { type: Number, default: 0 },
    // 2 step ver
    is2FA: { type: Boolean, default: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
        notificationsEnabled: { type: Boolean, default: true }

  },

  {
    timestamps: true,
    collection: "SOCIAL_MEDIA_USERS",
    validateBeforeSave: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoIndex: true,
  },
);
userSchema
  .virtual("userName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.pre(
  "save",
  async function (this: HydratedDocument<IUser> & { wasNew: boolean }) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) // لعدم تكرار الهاش
    {
      this.password = await generateHash({
        plainText: this.password as string,
      });
      console.log(this);
    }
    if (this.phone && this.isModified("phone")) {
      this.phone = await generateEncryption(this.phone);
    }
  },
);
userSchema.post("save", async function () {
  const that = this as HydratedDocument<IUser> & { wasNew: boolean };
  if (that.wasNew) {
    await sendEmail({
      to: this.email,
      subject: "Welcome to our app",
      html: `Hello ${this.firstName}, welcome to our app you will receive otp code to verify your email now check your email!`,
    });
  }
});

// soft delete without plugin
// userSchema.pre(
//   ["findOne", "find",],
//   function () {
//         const query = this.getQuery();

//     if(query.paranoId === false){
//       this.setQuery({...query})
//     }else{
// this.setQuery({ ...query, deletedAt: {$exists: false} });
//     }

//   }
// );

// userSchema.pre(
//   ["findOneAndUpdate","updateOne"],
//   function () {

// const update = this.getUpdate() as HydratedDocument<IUser>;
// if(update.deletedAt){
// this.setUpdate({ ...update, $unset: {restoredAt:1} });
// }
// if(update.restoredAt){
// this.setUpdate({ ...update, $unset: {deletedAt:1} });
// this.setQuery({...this.getQuery(), deletedAt: {$exists: true} })
// }

//         const query = this.getQuery();

//     if(query.paranoId === false){
//       this.setQuery({...query})
//     }else{
// this.setQuery({ deletedAt: {$exists: false},...query});
//     }

//   }
// );
userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const Query = this.getQuery();
  if (Query.force) {
    this.setQuery({ ...Query });
  } else {
    this.setQuery({ ...Query, deletedAt: { $exists: false } });
  }
});
// Cascade hard delete
// userSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
//   const doc = await this.model.findOne(this.getQuery());

//   if (!doc) return;

//   const options = [
//     { model: "Post", foreignKey: "userId" },
//     { model: "Comment", foreignKey: "userId" },
//     { model: "Reaction", foreignKey: "userId" },
//   ];

//   for (const item of options) {
//     const Model = mongoose.model(item.model);

//     await Model.deleteMany({
//       [item.foreignKey]: doc._id,
//     });
//   }
// });

// Cascade soft delete plugin لغاية ما نعمل باقي السكيما
userSchema.plugin(cascadeSoftDeletePlugin, [
  // { model: "Post", foreignKey: "userId" },
  // { model: "Comment", foreignKey: "userId" },
  // { model: "Reaction", foreignKey: "userId" },
]);
export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
