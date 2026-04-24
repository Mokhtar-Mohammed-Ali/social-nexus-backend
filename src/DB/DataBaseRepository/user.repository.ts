import { IUser } from "../../common/interfaces";
import { UserModel } from "../models";
import { DataBaseRepository } from "./base.repsitory";

export class userRepository extends DataBaseRepository<IUser> {

constructor(){
super(UserModel)
}

}