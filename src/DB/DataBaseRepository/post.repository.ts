
import { IPost } from "../../common/interfaces";
import { PostModel } from "../models/post.model";
import { DataBaseRepository } from "./base.repsitory";

export class PostRepository extends DataBaseRepository<IPost> {

constructor(){
super(PostModel)
}

}