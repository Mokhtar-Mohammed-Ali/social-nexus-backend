"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const send_email_1 = require("./../../common/services/email/send-email");
const mongoose_1 = __importDefault(require("mongoose"));
const enums_1 = require("../../common/enums");
const security_1 = require("../../common/utils/security");
const pluggins_1 = require("../../common/pluggins");
const mongoose_2 = require("mongoose");
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
    email: {
        type: String,
        unique: true,
    },
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
    friends: [{ type: mongoose_2.Types.ObjectId, ref: "User" }],
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
        enum: enums_1.ROLEENUM,
        default: enums_1.ROLEENUM.User,
    },
    visitCount: { type: Number, default: 0 },
    is2FA: { type: Boolean, default: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
    notificationsEnabled: { type: Boolean, default: true }
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
userSchema.pre("save", async function () {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, security_1.generateHash)({
            plainText: this.password,
        });
        console.log(this);
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await (0, security_1.generateEncryption)(this.phone);
    }
});
userSchema.post("save", async function () {
    const that = this;
    if (that.wasNew) {
        await (0, send_email_1.sendEmail)({
            to: this.email,
            subject: "Welcome to our app",
            html: `Hello ${this.firstName}, welcome to our app you will receive otp code to verify your email now check your email!`,
        });
    }
});
userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const Query = this.getQuery();
    if (Query.force) {
        this.setQuery({ ...Query });
    }
    else {
        this.setQuery({ ...Query, deletedAt: { $exists: false } });
    }
});
userSchema.plugin(pluggins_1.cascadeSoftDeletePlugin, []);
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
