"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_sevice_1 = require("../../modules/user/user.sevice");
const user_repository_1 = require("./../../DB/DataBaseRepository/user.repository");
const node_cron_1 = __importDefault(require("node-cron"));
class AccountCleanupJob {
    userRepository;
    constructor() {
        this.userRepository = new user_repository_1.userRepository();
    }
    start() {
        node_cron_1.default.schedule("0 0 * * *", async () => {
            console.log("Running account cleanup job...");
            const expiredUsers = await this.userRepository.find({
                filter: {
                    deletedAt: { $exists: true },
                    scheduledForDeletionAt: { $lte: new Date() },
                },
            });
            for (const user of expiredUsers) {
                try {
                    await user_sevice_1.userService.hardDeleteAccount(user._id);
                    console.log(`Deleted user ${user._id}`);
                }
                catch (error) {
                    console.error(`Failed deleting user ${user._id}`, error);
                }
            }
        });
    }
}
exports.default = new AccountCleanupJob();
