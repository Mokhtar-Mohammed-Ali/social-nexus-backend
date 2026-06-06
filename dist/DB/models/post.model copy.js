"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const enums_1 = require("../../common/enums");
const pluggins_1 = require("../../common/pluggins");
const postSchema = new mongoose_1.Schema({
    folderId: String,
    attachments: [String],
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        },
    },
    availability: {
        type: Number,
        enum: enums_1.availabilityEnum,
        default: enums_1.availabilityEnum.PUBLIC,
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    reactions: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            type: {
                type: String,
                enum: Object.values(enums_1.ReactionValue),
                required: true,
            },
        },
    ],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
    restoredAt: Date,
}, {
    timestamps: true,
    collection: "POSTS",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoIndex: true,
});
postSchema.index({ createdBy: 1, createdAt: -1 });
postSchema.pre(["find", "findOne", "countDocuments"], function () {
    const query = this.getQuery();
    if (!query.force) {
        this.setQuery({ ...query, deletedAt: null });
    }
});
postSchema.pre(["deleteOne", "countDocuments", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force) {
        this.setQuery({ ...query });
    }
    else {
        this.setUpdate({ $set: { deletedAt: new Date() } });
    }
});
postSchema.plugin(pluggins_1.cascadeSoftDeletePlugin, []);
exports.PostModel = mongoose_1.default.models.Post || mongoose_1.default.model("Post", postSchema);
