import { Server } from "socket.io";
import { redisServices, Redisservices, TokenService } from "../../common/services";
import { Server as HttpServer } from "node:http";
import { IAuthSocket } from "../../common/types/express.types";
import { chatGateWay } from "../chat";
export class RealTimeGaeWay{
private tokenService : TokenService;
private redisServices : Redisservices;
private io!:Server
constructor(){
    this.tokenService=new TokenService()
    this.redisServices= redisServices
}

authentication=async (socket: IAuthSocket, next: any) => {
        try {
         
          const { user, decoded } = await this.tokenService.decodeToken({
            token: socket.handshake.auth.authorization||socket.handshake.headers.authorization,
          });
          console.log({ user: user._id, socketId: socket.id });
          socket.data = { user, decoded };
          await this.redisServices.addSocket(user._id, socket.id);
          next();
        } catch (error) {
          next(error);
          // socket.emit("custom-error",error)
        }
      }
initializeIo=(httpServer:HttpServer)=>{


    this.io = new Server(httpServer, { cors: { origin: "*" } });
      this.io.use(this.authentication);
      this.io.on("connection", async (socket: IAuthSocket) => {
        chatGateWay.registerEvents(socket,this.io)
        console.log(socket.id, socket.data.decoded);
        console.log({
          connection: await this. redisServices.getSockets(socket.data.user._id),
        });
       
        socket.on("disconnect",async()=>{
          console.log(socket.id,socket.data.user._id)
          await this. redisServices.removeSocket(socket.data.user._id,socket.id)
       const connection=await this. redisServices.getSockets(socket.data.user._id)
       if(connection?.length < 1 ){
       this. io.emit("offline_user",{userId:socket.data.user._id})
       }
    
        })
      });
}
getIo(){
  return this.io
}
}

export const realTimeGateWay=new RealTimeGaeWay()