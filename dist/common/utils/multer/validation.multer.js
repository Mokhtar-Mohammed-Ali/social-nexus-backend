"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = exports.fileFieldValidation = void 0;
const exptions_1 = require("../../exptions");
exports.fileFieldValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    video: ["video/mp4", "video/mpeg", "video/quicktime"],
    audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};
const fileFilter = (validation) => {
    return function (req, file, cb) {
        {
            if (!validation.includes(file.mimetype)) {
                return cb(new exptions_1.BadRequestExpetions("invalid file format"));
            }
            cb(null, true);
        }
    };
};
exports.fileFilter = fileFilter;
