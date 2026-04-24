
import mongoose from "mongoose";
import { IUser } from "../../common/interfaces";
import { GENDERENUM, PROVIDERENUM, ROLEENUM } from "../../common/enums";


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
    email: { type: String, // required: true,
      unique: true },
    confirmEmail: { type: Date },
    changeCredentialsTime: { type: Date },
    gender: {
      type: Number,
      enum: GENDERENUM,
      default: GENDERENUM.Male,
    },
    password: {
      type: String,
      required: function () : boolean {
        return this.provider == PROVIDERENUM.SYSTEM;
      },
    },
    oldPassword: { type: [String] },
    // phone: { type: String, required: true },
    phone: {
      type: String,
      required: function (): boolean {
        return this.provider == PROVIDERENUM.SYSTEM;
      },
    },
    profilePicCover: { type: [String] },
    profilePic: { type: String },
    profileGallery: { type: [String] },
    provider: {
      type: Number,
      enum: PROVIDERENUM ,
      default: PROVIDERENUM.SYSTEM,
    },
    role: {
      type: Number,
      enum: ROLEENUM,      default: ROLEENUM.User,
    },
    visitCount: { type: Number, default: 0 },
    // 2 step ver
    is2FA: { type: Boolean, default: false },
   
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
export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
