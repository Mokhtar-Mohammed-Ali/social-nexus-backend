"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (error, req, res, next) => {
    if (error.name == "MulterError") {
        error.status = 400;
    }
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || "Internal Server Error",
        cause: error.cause || null,
        stack: error.stack || null,
        error
    });
};
exports.globalErrorHandler = globalErrorHandler;
exports.default = exports.globalErrorHandler;
