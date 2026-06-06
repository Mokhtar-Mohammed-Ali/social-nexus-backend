"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("./common/response/success.response");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const error_middleware_1 = __importDefault(require("./middlware/error.middleware"));
const config_service_1 = require("./config/config.service");
const connection_db_1 = require("./DB/connection.db");
const services_1 = require("./common/services");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const account_cleanup_job_1 = __importDefault(require("./common/jobs/account-cleanup.job"));
const comment_1 = require("./modules/comment");
const express_2 = require("graphql-http/lib/use/express");
const middlware_1 = require("./middlware");
async function bootstrap() {
    const s3writable = (0, node_util_1.promisify)(node_stream_1.pipeline);
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    await (0, connection_db_1.connectionDB)();
    await services_1.redisServices.connect();
    app.all("/graphql", (0, middlware_1.authentication)(), (0, express_2.createHandler)({ schema: modules_1.schema, context: (req) => ({ user: req.raw.user, decoded: req.raw.decoded }) }));
    app.use((req, res, next) => {
        console.log(`Incoming request: ${req.method} ${req.url}`);
        next();
    });
    app.use("/post/:postId/comments", comment_1.commentRouter);
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.UserRouter);
    app.use("/post", modules_1.postRouter);
    app.get("/upoads/*path", async (req, res, next) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await services_1.s3Service.getAsset({ Key });
        console.log({ Body, ContentType });
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3writable(Body, res);
    });
    app.get("/presigned/*path", async (req, res, next) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await services_1.s3Service.getPresignedUploadLink({
            Key,
            download,
            fileName,
        });
        return (0, success_response_1.successResponse)({ res, data: { url } });
    });
    account_cleanup_job_1.default.start();
    app.use("{/*dummy}", (req, res) => {
        return res.status(404).json({ message: "Invalid application routing" });
    });
    app.use(error_middleware_1.default);
    app.listen(config_service_1.port, () => console.log(`Example app listening on port ${config_service_1.port}!`));
}
exports.default = bootstrap;
