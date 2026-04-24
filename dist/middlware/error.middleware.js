"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalErrorHandler = (error, req, res, next) => {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || "Internal Server Error",
        cause: error.cause || null,
        stack: error.stack || null,
        error
    });
};
exports.default = globalErrorHandler;
