import { HydratedDocument } from "mongoose";
import { IUser } from "../interfaces";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
    export interface Request {
        user: HydratedDocument<IUser>;
        decoded: JwtPayload;
    }}