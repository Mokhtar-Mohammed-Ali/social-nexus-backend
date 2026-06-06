// import { reactParamsPostDTO, reactQueryPostDTO, updateBodyPostDTO, updateParamsPostDTO } from './post.DTO';
// import { Router, Request, Response, NextFunction } from "express";
// import { authentication, validation } from "../../middlware";
// import { cloudeFileUploade, fileFieldValidation } from "../../common/utils/multer";
// import { successResponse } from "../../common/response";
// import * as validators from"./post.validation";
// import { postService } from "./post.service";
// import { paginateDto, paginationValidationSchema } from "../../common/utils";
// const router = Router();
// // create post
// router.post(
//   "/",
//   authentication(),
//   cloudeFileUploade({ validation: fileFieldValidation.image }).array("attachments", 2),
//   validation(validators.postSchemaValidation),
//   async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
//       const data = await postService.createPost({...req.body,files: req.files}, req.user);
   
      
//       return successResponse({ res,data, status: 201 });
   
//   }
// );

// //find all posts of the user
// router.get(
//   "/",
//   authentication(),
//   validation(paginationValidationSchema),
//   async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
//       const data = await postService.listUserPosts(req.query as paginateDto, req.user);
   
      
//       return successResponse({ res,data, status: 200});
   
//   }
// );

// // react to post
// router.patch(
//   "/:postId/react",
//   authentication(),
//   validation(validators.reactSchemaValidation),
//   async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
//       const data = await postService.reactOnPost(req.params as reactParamsPostDTO , req.query as unknown as reactQueryPostDTO, req.user);
   
      
//       return successResponse({ res,data, status: 200});
   
//   }
// );


// // update post
// router.patch(
//   "/:postId",
//   authentication(),
//   cloudeFileUploade({ validation: fileFieldValidation.image }).array("attachments", 2),
//   validation(validators.updatePostSchemaValidation),
//   async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
//       const data = await postService.updatePost(req.params as updateParamsPostDTO , req.body as unknown as updateBodyPostDTO, req.user);
   
      
//       return successResponse({ res,data, status: 200});
   
//   }
// );

// export default router;


import { Router, Request, Response } from "express";
import { authentication } from "../../middlware";
import { cloudeFileUploade, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import { commentService } from "./comment.service";
import { CreateCommentParamsDTO, CreateCommentBodyDTO, } from "./comment.DTO";
import { updateParamsPostDTO } from "../post/post.DTO";

const router = Router({ mergeParams: true });

interface CommentParams {
  postId: string;
  commentId?: string;
}

router.post("/", authentication(), cloudeFileUploade({ validation: fileFieldValidation.image }).array("attachments", 2), async (req: Request, res: Response) => {
  const params = req.params as unknown as CreateCommentParamsDTO;
  const data = await commentService.createComment(params, req.body as CreateCommentBodyDTO, req.files as Express.Multer.File[], req.user);
  return successResponse({ res, data, status: 201 });
});

router.patch("/:commentId", authentication(), cloudeFileUploade({ validation: fileFieldValidation.image }).array("attachments", 2), async (req: Request, res: Response) => {
  const { commentId } = req.params as unknown as CommentParams;
  const data = await commentService.updateComment(commentId!, req.user._id, req.body, req.files as Express.Multer.File[]);
  return successResponse({ res, data, status: 200 });
});

router.patch("/:commentId/react", authentication(), async (req: Request, res: Response) => {
  const { commentId } = req.params as unknown as CommentParams;
  const data = await commentService.reactOnComment(commentId!, req.user._id, Number(req.query.reaction));
  return successResponse({ res, data, status: 200 });
});

router.delete("/:commentId", authentication(), async (req: Request, res: Response) => {
  const { commentId } = req.params as unknown as CommentParams;
  await commentService.deleteComment(commentId!, req.user._id);
  return successResponse({ res, data: "Comment deleted", status: 200 });
});

router.get("/", async (req: Request, res: Response) => {
  // هنا الحل للخطأ: تحديد نوع الـ params بوضوح
  const { postId } = req.params as unknown as updateParamsPostDTO;
  const data = await commentService.getCommentsByPost(postId);
  return successResponse({ res, data, status: 200 });
});

export default router;