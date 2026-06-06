import { INotification } from "../../common/interfaces";
import { NotificationModel } from "../models/notification.module";
import { DataBaseRepository } from "./base.repsitory";

export class NotificationRepository extends DataBaseRepository<INotification> {
  constructor() {
    super(NotificationModel);
  }
}