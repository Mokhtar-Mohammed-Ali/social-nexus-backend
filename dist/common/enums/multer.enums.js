"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsEnum = exports.MulterStorage = void 0;
var MulterStorage;
(function (MulterStorage) {
    MulterStorage[MulterStorage["DISK"] = 0] = "DISK";
    MulterStorage[MulterStorage["MEMORY"] = 1] = "MEMORY";
})(MulterStorage || (exports.MulterStorage = MulterStorage = {}));
var UploadsEnum;
(function (UploadsEnum) {
    UploadsEnum[UploadsEnum["SMALL"] = 0] = "SMALL";
    UploadsEnum[UploadsEnum["LARGE"] = 1] = "LARGE";
})(UploadsEnum || (exports.UploadsEnum = UploadsEnum = {}));
