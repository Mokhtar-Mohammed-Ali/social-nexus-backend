"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
class NotificationService {
    client;
    constructor() {
        const serviceAccount = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "src/config/social-media-clone-65300-firebase-adminsdk-fbsvc-b241676a26.json"), "utf8"));
        if (!firebase_admin_1.default.apps.length) {
            this.client = firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
        }
        else {
            this.client = firebase_admin_1.default.app();
        }
    }
    async sendNotification({ token, data, }) {
        const message = {
            token,
            data,
        };
        return await this.client.messaging().send(message);
    }
    async sendNotifications({ tokens, data, }) {
        return await Promise.allSettled(tokens.map((token) => this.sendNotification({
            token,
            data,
        })));
    }
}
exports.NotificationService = NotificationService;
