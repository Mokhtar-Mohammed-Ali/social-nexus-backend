"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const models_1 = require("../models");
const base_repsitory_1 = require("./base.repsitory");
class userRepository extends base_repsitory_1.DataBaseRepository {
    constructor() {
        super(models_1.UserModel);
    }
}
exports.userRepository = userRepository;
