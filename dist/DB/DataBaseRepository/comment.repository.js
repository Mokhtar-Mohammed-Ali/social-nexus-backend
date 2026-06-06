"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const models_1 = require("../models");
const base_repsitory_1 = require("./base.repsitory");
class CommentRepository extends base_repsitory_1.DataBaseRepository {
    constructor() {
        super(models_1.CommentModel);
    }
}
exports.CommentRepository = CommentRepository;
