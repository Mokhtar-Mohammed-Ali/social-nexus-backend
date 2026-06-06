import { postService, PostService } from "../post.service"
import { IAuthUser } from "../../../common/types/express.types"
import { GQLvalidation } from "../../../middlware"
import { paginateDto, paginationValidationSchema } from "../../../common/utils"
import { reactGQLSchemaValidation } from "../post.validation"
import { reactGqlPostDTO } from "../post.DTO"


export class PostResolverGql{
    private postService:PostService
    // private token:TokenService
    constructor (){
        // this.token=new TokenService()
this.postService=postService
    }
    postList=async(parent:unknown,args:paginateDto,{user,decoded}:IAuthUser)=>{
       
       
        // console.log({token:context.req.headers.authorization})
        // const token=context.req.headers.authorization.split(" ")[1];
    //    const {user}= await this.token.decodeToken({token,tokenType:TOKENTYPEENUM.ACCESS})
       await GQLvalidation<paginateDto>(paginationValidationSchema.query,args)
    
        const data = await this.postService.listUserPosts(args,user)
        return{message:"done",data}
    }

    reactOnpost=async(parent:unknown,{reaction,postId}:reactGqlPostDTO,{user,decoded}:IAuthUser)=>{
       
       
        // console.log({token:context.req.headers.authorization})
        // const token=context.req.headers.authorization.split(" ")[1];
    //    const {user}= await this.token.decodeToken({token,tokenType:TOKENTYPEENUM.ACCESS})
       await GQLvalidation<reactGqlPostDTO>(reactGQLSchemaValidation,{reaction,postId})
    
        const data = await this.postService.reactOnPost({postId},{reaction},user)
        return{message:"done",data}
    }

}

export const postResolverGql=new PostResolverGql()