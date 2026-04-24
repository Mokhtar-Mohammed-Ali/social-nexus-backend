"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enums_1 = require("../../common/enums");
const userSchema = new mongoose_1.default.Schema({
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
    email: { type: String,
        unique: true },
    confirmEmail: { type: Date },
    changeCredentialsTime: { type: Date },
    gender: {
        type: Number,
        enum: enums_1.GENDERENUM,
        default: enums_1.GENDERENUM.Male,
    },
    password: {
        type: String,
        required: function () {
            return this.provider == enums_1.PROVIDERENUM.SYSTEM;
        },
    },
    oldPassword: { type: [String] },
    phone: {
        type: String,
        required: function () {
            return this.provider == enums_1.PROVIDERENUM.SYSTEM;
        },
    },
    profilePicCover: { type: [String] },
    profilePic: { type: String },
    profileGallery: { type: [String] },
    provider: {
        type: Number,
        enum: enums_1.PROVIDERENUM,
        default: enums_1.PROVIDERENUM.SYSTEM,
    },
    role: {
        type: Number,
        enum: enums_1.ROLEENUM, default: enums_1.ROLEENUM.User,
    },
    visitCount: { type: Number, default: 0 },
    is2FA: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: "SOCIAL_MEDIA_USERS",
    validateBeforeSave: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoIndex: true,
});
userSchema
    .virtual("userName")
    .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
