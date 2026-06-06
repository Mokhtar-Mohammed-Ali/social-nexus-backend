"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cascadeSoftDeletePlugin = cascadeSoftDeletePlugin;
const mongoose_1 = __importDefault(require("mongoose"));
function cascadeSoftDeletePlugin(schema, options) {
    schema.post("findOneAndUpdate", async function (doc) {
        if (!doc)
            return;
        const update = this.getUpdate();
        for (const item of options) {
            const Model = mongoose_1.default.model(item.model);
            if (update.deletedAt) {
                await Model.updateMany({ [item.foreignKey]: doc._id }, {
                    deletedAt: new Date(),
                    $unset: { restoredAt: 1 },
                });
            }
            if (update.restoredAt) {
                await Model.updateMany({
                    [item.foreignKey]: doc._id,
                    deletedAt: { $exists: true }
                }, {
                    restoredAt: new Date(),
                    $unset: { deletedAt: 1 },
                });
            }
        }
    });
}
