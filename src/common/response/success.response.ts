// import { Response } from "express";

// export const successResponse =<T> ({
// data ,
// message="done",
// status=200,
// res

// }: { data?: T, res: Response ,message?: string,status?: number}) => {

//     return res.status(status).json({

//         message: message ,
//         data,

//     });

// };

import { Response } from "express";

export const successResponse = <T>({
  data,
  message = "done",
  status = 200,
  res,
}: {
  data?: T;
  res: Response;
  message?: string;
  status?: number;
}) => {
  return res.status(status).json({
    message,
    data,
    status,
  });
};
