import {z} from "zod";
import { commSchemaValidation } from "./comment.validation";
export type CreateCommentBodyDTO = z.infer<typeof commSchemaValidation.body>



export type CreateCommentParamsDTO = z.infer<typeof commSchemaValidation.params>

