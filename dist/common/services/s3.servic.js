"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const config_service_1 = require("./../../config/config.service");
const client_s3_1 = require("@aws-sdk/client-s3");
const node_crypto_1 = require("node:crypto");
const exptions_1 = require("../exptions");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_service_1.AWS_REGION,
            credentials: {
                accessKeyId: config_service_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_service_1.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async uploadAsset({ ACL = client_s3_1.ObjectCannedACL.private, Bucket, path = "general", file, ContentType, }) {
        const command = new client_s3_1.PutObjectCommand({
            ACL,
            Bucket,
            Key: `${config_service_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype || ContentType,
        });
        if (!command.input.Key) {
            throw new exptions_1.BadRequestExpetions("cannot upload file");
        }
        await this.client.send(command);
        return command.input.Key;
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
