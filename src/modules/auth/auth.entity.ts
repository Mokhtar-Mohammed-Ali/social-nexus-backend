export interface IloginResponse{
   accessToken: string, refreshToken: string
}


export interface IsignUpResponse extends IloginResponse{
    username:string;
    _id:string;
}