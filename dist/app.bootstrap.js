"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const error_middleware_1 = __importDefault(require("./middlware/error.middleware"));
const config_service_1 = require("./config/config.service");
const connection_db_1 = require("./DB/connection.db");
const services_1 = require("./common/services");
async function bootstrap() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    await (0, connection_db_1.connectionDB)();
    await services_1.redisServices.connect();
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.UserRouter);
    app.use("{/*dummy}", (req, res) => {
        return res.status(404).json({ message: "Invalid application routing" });
    });
    app.use(error_middleware_1.default);
    app.listen(config_service_1.port, () => console.log(`Example app listening on port ${config_service_1.port}!`));
}
exports.default = bootstrap;
