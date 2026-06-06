"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const notification_module_1 = require("../models/notification.module");
const base_repsitory_1 = require("./base.repsitory");
class NotificationRepository extends base_repsitory_1.DataBaseRepository {
    constructor() {
        super(notification_module_1.NotificationModel);
    }
}
exports.NotificationRepository = NotificationRepository;
