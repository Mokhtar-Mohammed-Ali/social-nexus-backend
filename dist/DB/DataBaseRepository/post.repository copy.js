"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const post_model_1 = require("../models/post.model");
const base_repsitory_1 = require("./base.repsitory");
class PostRepository extends base_repsitory_1.DataBaseRepository {
    constructor() {
        super(post_model_1.PostModel);
    }
}
exports.PostRepository = PostRepository;
