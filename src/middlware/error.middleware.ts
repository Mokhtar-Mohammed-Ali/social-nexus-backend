import { NextFunction, Request, Response } from "express";


interface IError extends Error {

    status: number;
   
 
}
 const globalErrorHandler = (error: IError, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500;
        return res.status(status).json({ message: error.message || "Internal Server Error" ,
cause: error.cause || null,
stack: error.stack || null,
error

        });    

}
export default globalErrorHandler;