"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlware_1 = require("../../middlware");
const multer_1 = require("../../common/utils/multer");
const response_1 = require("../../common/response");
const comment_service_1 = require("./comment.service");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/", (0, middlware_1.authentication)(), (0, multer_1.cloudeFileUploade)({ validation: multer_1.fileFieldValidation.image }).array("attachments", 2), async (req, res) => {
    const params = req.params;
    const data = await comment_service_1.commentService.createComment(params, req.body, req.files, req.user);
    return (0, response_1.successResponse)({ res, data, status: 201 });
});
router.patch("/:commentId", (0, middlware_1.authentication)(), (0, multer_1.cloudeFileUploade)({ validation: multer_1.fileFieldValidation.image }).array("attachments", 2), async (req, res) => {
    const { commentId } = req.params;
    const data = await comment_service_1.commentService.updateComment(commentId, req.user._id, req.body, req.files);
    return (0, response_1.successResponse)({ res, data, status: 200 });
});
router.patch("/:commentId/react", (0, middlware_1.authentication)(), async (req, res) => {
    const { commentId } = req.params;
    const data = await comment_service_1.commentService.reactOnComment(commentId, req.user._id, Number(req.query.reaction));
    return (0, response_1.successResponse)({ res, data, status: 200 });
});
router.delete("/:commentId", (0, middlware_1.authentication)(), async (req, res) => {
    const { commentId } = req.params;
    await comment_service_1.commentService.deleteComment(commentId, req.user._id);
    return (0, response_1.successResponse)({ res, data: "Comment deleted", status: 200 });
});
router.get("/", async (req, res) => {
    const { postId } = req.params;
    const data = await comment_service_1.commentService.getCommentsByPost(postId);
    return (0, response_1.successResponse)({ res, data, status: 200 });
});
exports.default = router;
