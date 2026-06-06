import { userService } from "../../modules/user/user.sevice";
import { userRepository } from "./../../DB/DataBaseRepository/user.repository";
import cron from "node-cron";

class AccountCleanupJob {
  private readonly userRepository: userRepository;
  constructor() {
    this.userRepository = new userRepository();
  }
  start() {
    cron.schedule("0 0 * * *", async () => {
      console.log("Running account cleanup job...");

      const expiredUsers = await this.userRepository.find({
        filter: {
          deletedAt: { $exists: true },
          scheduledForDeletionAt: { $lte: new Date() },
        },
      });

      for (const user of expiredUsers) {
        try {
          await userService.hardDeleteAccount(user._id);

          console.log(`Deleted user ${user._id}`);
        } catch (error) {
          console.error(`Failed deleting user ${user._id}`, error);
        }
      }
    });
  }
}

export default new AccountCleanupJob();
