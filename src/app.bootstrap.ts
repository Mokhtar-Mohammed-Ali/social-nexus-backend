// import { globalErrorHandling, sendEmail } from "./common/utils/index.js";
// import { redisConnection, connectionDB, redisClient } from "./DB/index.js";
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import { authRouter,UserRouter } from "./modules";
import globalErrorHandler from "./middlware/error.middleware";
import { port } from "./config/config.service";
import { connectionDB } from "./DB/connection.db";
import { redisServices } from "./common/services";
// import { globalErrorHandling } from "./middlware";
// import { resolve } from "path";
// import helmet from "helmet";
// import { ipKeyGenerator, rateLimit } from "express-rate-limit";
// import axios from "axios";
// import geoip from "geoip-lite"
// import morgan from "morgan";

async function bootstrap(): Promise<void> {
  const app: Express = express();
  //convert buffer data and origins
  //   const corsOptions = () => {
  //    const allowedOrigins = ALLOW_ORIGINS || "".split(',') ;

  //    return cors({
  //      origin: function (origin, callback) {
  //        if (!origin || allowedOrigins.includes(origin)) {
  //          callback(null, true);
  //        } else {
  //          callback(new Error(`Origin ${origin} not allowed by CORS ⛔`));
  //        }
  //      },
  //      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'id'],
  //      credentials: true,
  //    });
  // };

  // ip location
  // const fromWhere = async (ip) => {
  //   try {
  //     const response = await axios.get(`https://ipapi.co/${ip}/json`);
  //     console.log(response.data);
  //     return response.data
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  //global rate limit operation
  // const limiter = rateLimit({
  //   windowMs: 2 * 60 * 1000, // 2 minutes
  //   limit: async function (req) {

  //geoip
  // const{country}=geoip.lookup(req.ip) ||""
  // console.log(geoip.lookup(req.ip))
  //   return country == "EG" ? 5 : 2;

  // },

  // standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // requestPropertyName: "ratelimit",

  // skip login
  // skip: (req, res) => {
  // return req.originalUrl.includes('/auth/login')},
  // handler: (req, res, nex) => {
  //   return res
  //     .status(429)
  //     .json({ message: "to many request try again later" });
  // },

  //   keyGenerator: (req) => {
  //   const ip = ipKeyGenerator(req.ip, 56);
  //   return `${ip}-${req.originalUrl}`;
  // },
  //    store: {
  //   async incr(key, cb) { // get called by keyGenerator
  //     try {
  //       const count = await redisClient.incr(key);
  //       if (count === 1) await redisClient.expire(key, 120); // 2 min TTL
  //       cb(null, count);
  //     } catch (err) {
  //       cb(err);
  //     }
  //   },

  //   async decrement(key) {  // called by kipFailedRequests:true ,  skipSuccessfulRequests:true,
  //       //del // decr
  //    await redisClient.del(key);
  //   },
  // },
  // });

  // // set ip address
  // app.set("trust proxy", true);
  // // app.use(corsOptions())
  app.use(cors());
  // app.use(morgan("dev"));
  // app.use(helmet());
  app.use(express.json());
  // app.use(limiter);

  // // uploads folder static access
  // app.use("/uploads", express.static(resolve("../uploads")));
  // // DB connection
  await connectionDB();
  await redisServices.connect();

  //application routing
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
  });
  app.use("/auth", authRouter);
  app.use("/user", UserRouter);
  // app.use("/message", messageRouter);

  //invalid routing
  app.use("{/*dummy}", (req: Request, res: Response) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  //error-handling
  app.use(globalErrorHandler);

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
export default bootstrap;
