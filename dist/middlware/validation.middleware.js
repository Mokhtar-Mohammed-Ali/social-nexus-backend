"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const exptions_1 = require("../common/exptions");
const validation = (schema) => {
    return (req, res, next) => {
        const isseus = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error;
                isseus.push({
                    key,
                    isseus: error.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path,
                    })),
                });
            }
        }
        if (isseus.length) {
            throw new exptions_1.BadRequestExpetions("validation error", isseus);
        }
        next();
    };
};
exports.validation = validation;
