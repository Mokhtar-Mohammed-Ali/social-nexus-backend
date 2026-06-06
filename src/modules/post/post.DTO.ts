import {z} from "zod";
import { postSchemaValidation, reactGQLSchemaValidation, reactSchemaValidation, updatePostSchemaValidation } from "./post.validation";
export type CreatePostDTO = z.infer<typeof postSchemaValidation.body>


export type UpdatePostDTO = z.infer<typeof postSchemaValidation.body>
export type reactQueryPostDTO = z.infer<typeof reactSchemaValidation.query>
export type reactParamsPostDTO = z.infer<typeof reactSchemaValidation.params>

export type updateParamsPostDTO = z.infer<typeof updatePostSchemaValidation.params>
export type updateBodyPostDTO = z.infer<typeof updatePostSchemaValidation.body>
//gql
export type reactGqlPostDTO = z.infer<typeof reactGQLSchemaValidation>
