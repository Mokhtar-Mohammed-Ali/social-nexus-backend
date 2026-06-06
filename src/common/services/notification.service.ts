import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export class NotificationService {
  private client: admin.app.App;

  constructor() {
    const serviceAccount = JSON.parse(
      readFileSync(
        resolve(
          process.cwd(),
          "src/config/social-media-clone-65300-firebase-adminsdk-fbsvc-b241676a26.json"
        ),
        "utf8"
      )
    );

    // ✅ Prevent duplicate initialization
    if (!admin.apps.length) {
      this.client = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      this.client = admin.app();
    }
  }

  // 🔔 Send single notification
  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: {
      title: string;
      body: string;
    };
  }) {
    const message = {
      token,
      data,
    };

    return await this.client.messaging().send(message);
  }

  // 🔔 Send multiple notifications
  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: {
      title: string;
      body: string;
    };
  }) {
    return await Promise.allSettled(
      tokens.map((token) =>
        this.sendNotification({
          token,
          data,
        })
      )
    );
  }
}