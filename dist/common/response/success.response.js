"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ data, message = "done", status = 200, res, }) => {
    return res.status(status).json({
        message,
        data,
        status,
    });
};
exports.successResponse = successResponse;
