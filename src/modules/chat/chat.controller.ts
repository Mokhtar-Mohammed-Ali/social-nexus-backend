import type{ NextFunction, Request, Response } from "express";
import { Router } from "express";
import { authentication } from "../../middlware";
import { successResponse } from "../../common/response";
import { chatService } from "./chat.service";
import { cloudeFileUploade, fileFieldValidation } from "../../common/utils/multer";

const router=Router({mergeParams:true})
//get chat
router.get("/",authentication(),async(req:Request,res:Response,next:NextFunction)=>{
const chat=await chatService.getChat(req.params.userId as string,req.user,req.query as unknown as {page:string,size:string})
    return successResponse({res,data:{chat}})
})
// get group chat

router.get(
    "/group/:groupId",
    authentication(),
    async (req: Request, res: Response, next: NextFunction) => {
        const chat = await chatService.getGroupChat(
            req.params.groupId as string, 
            req.query as unknown as {page:string,size:string},
           req.user,
        );
        return successResponse({ res, data: { chat } });
    }
);
// create group
router.post(
  "/group",
  authentication(),
  cloudeFileUploade({ validation: fileFieldValidation.image }).single("attachment"),
  async (req: Request, res: Response, next: NextFunction) => {
    const chat = await chatService.createGroup(
      req.body,
       req.user,
      req.file as Express.Multer.File,
     
    );

    return successResponse({ res, data: { chat } });
  }
);

export default router