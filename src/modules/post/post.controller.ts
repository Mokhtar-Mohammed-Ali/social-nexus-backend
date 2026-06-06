import { reactParamsPostDTO, reactQueryPostDTO, updateBodyPostDTO, updateParamsPostDTO } from './post.DTO';
import { Router, Request, Response, NextFunction } from "express";
import { authentication, validation } from "../../middlware";
import { cloudeFileUploade, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from"./post.validation";
import { postService } from "./post.service";
import { paginateDto, paginationValidationSchema } from "../../common/utils";
const router = Router();
// create post
router.post(
  "/",
  authentication(),
  cloudeFileUploade({ validation: fileFieldValidation.image }).array("attachments", 2),
  validation(validators.postSchemaValidation),
  async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
      const data = await postService.createPost({...req.body,files: req.files}, req.user);
   
      
      return successResponse({ res,data, status: 201 });
   
  }
);

//find all posts of the user
router.get(
  "/",
  authentication(),
  validation(paginationValidationSchema),
  async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
      const data = await postService.listUserPosts(req.query as paginateDto, req.user);
   
      
      return successResponse({ res,data, status: 200});
   
  }
);

// react to post
router.patch(
  "/:postId/react",
  authentication(),
  validation(validators.reactSchemaValidation),
  async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
      const data = await postService.reactOnPost(req.params as reactParamsPostDTO , req.query as unknown as reactQueryPostDTO, req.user);
   
      
      return successResponse({ res,data, status: 200});
   
  }
);


// update post
router.patch(
  "/:postId",
  authentication(),
  cloudeFileUploade({ validation: fileFieldValidation.image }).array("attachments", 2),
  validation(validators.updatePostSchemaValidation),
  async (req: Request, res: Response, next: NextFunction) :Promise<Response>=> {
 
      const data = await postService.updatePost(req.params as updateParamsPostDTO , req.body as unknown as updateBodyPostDTO, req.user);
   
      
      return successResponse({ res,data, status: 200});
   
  }
);

export default router;