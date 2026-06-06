"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const config_service_1 = require("../../config/config.service");
const client_s3_1 = require("@aws-sdk/client-s3");
const node_crypto_1 = require("node:crypto");
const exptions_1 = require("../exptions");
const enums_1 = require("../enums");
const node_fs_1 = require("node:fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
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
    async uploadAsset({ storageApproache = enums_1.MulterStorage.MEMORY, ACL = client_s3_1.ObjectCannedACL.private, Bucket, path = "general", file, ContentType, }) {
        const command = new client_s3_1.PutObjectCommand({
            ACL,
            Bucket,
            Key: `${config_service_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            Body: storageApproache === enums_1.MulterStorage.MEMORY
                ? file.buffer
                : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype || ContentType,
        });
        if (!command.input.Key) {
            throw new exptions_1.BadRequestExpetions("cannot upload file");
        }
        await this.client.send(command);
        return command.input.Key;
    }
    async uploadLargeAsset({ storageApproache = enums_1.MulterStorage.DISK, ACL = client_s3_1.ObjectCannedACL.private, Bucket, path = "general", file, ContentType, partSize = 5, }) {
        const uploadFile = new lib_storage_1.Upload({
            client: this.client,
            params: {
                ACL,
                Bucket,
                Key: `${config_service_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
                Body: storageApproache === enums_1.MulterStorage.MEMORY
                    ? file.buffer
                    : (0, node_fs_1.createReadStream)(file.path),
                ContentType: file.mimetype || ContentType,
            },
            partSize: partSize * 1024 * 1024,
        });
        uploadFile.on("httpUploadProgress", (progress) => {
            console.log(progress);
            console.log(`uploaded ${Math.round((progress.loaded / progress.total) * 100)}%`);
        });
        return await uploadFile.done();
    }
    async uploadAssets({ storageApproache = enums_1.MulterStorage.MEMORY, uploadApproache = enums_1.UploadsEnum.SMALL, ACL = client_s3_1.ObjectCannedACL.private, Bucket, path = "general", files, ContentType, }) {
        let urls = [];
        if (uploadApproache === enums_1.UploadsEnum.SMALL) {
            urls = await Promise.all(files.map((file) => {
                return this.uploadAsset({
                    storageApproache,
                    ACL,
                    Bucket,
                    path,
                    file,
                    ContentType,
                });
            }));
        }
        else {
            const data = await Promise.all(files.map((file) => {
                return this.uploadLargeAsset({
                    storageApproache,
                    ACL,
                    Bucket,
                    path,
                    file,
                    ContentType,
                });
            }));
            urls = data.map((ele) => ele.Key);
        }
        return urls;
    }
    async PresignedUploadLink({ Bucket, path = "general", ContentType, originalname, expiresIn = config_service_1.AWS_EXPIRATION_TIME }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_service_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${originalname}`,
            ContentType,
        });
        if (!command.input.Key) {
            throw new exptions_1.BadRequestExpetions("cannot upload file");
        }
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return { url, key: command.input.Key };
    }
    async getPresignedUploadLink({ Bucket, Key, fileName, download, expiresIn = config_service_1.AWS_EXPIRATION_TIME }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true" ? `attachment; filename="${fileName || Key.split("/").pop()}"` : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
    async getAsset({ Bucket, Key }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key
        });
        return await this.client.send(command);
    }
    async deleteAsset({ Bucket, Key }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key
        });
        return await this.client.send(command);
    }
    async deleteAssets({ Bucket, Keys }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: { Objects: Keys, Quiet: false }
        });
        return await this.client.send(command);
    }
    async listFileDirectory({ Bucket = config_service_1.AWS_S3_BUCKET_NAME, prefix, }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: `${config_service_1.APPLICATION_NAME}/${prefix}/`,
        });
        return await this.client.send(command);
    }
    async deleteFolderContent({ Bucket = config_service_1.AWS_S3_BUCKET_NAME, prifix, }) {
        const result = await this.listFileDirectory({ Bucket, prefix: prifix });
        const keys = result.Contents?.map((ele) => ({ Key: ele.Key })) || [];
        return await this.deleteAssets({ Bucket, Keys: keys });
    }
    ;
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
