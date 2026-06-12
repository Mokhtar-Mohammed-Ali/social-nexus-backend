import { Server } from "socket.io";
import { IAuthSocket } from "../../../common/types/express.types";
import { Socketvalidation } from "../../../middlware";
import { chatService, ChatService } from "../chat.service";
import * as validators from "../chat.validation";
import { redisServices, Redisservices } from "../../../common/services";
export class ChatEvent {
  private chatService: ChatService;
  private  redis: Redisservices;
 constructor() {
    this.chatService = chatService;
    this.redis = redisServices;
  }

  sayHi = async (socket: IAuthSocket) => {
    return socket.on("sayhi", async (data: { name: string }) => {
      try {
        await Socketvalidation<{ name: string }>(
          validators.sayHiValidation,
          data,
        );
        const result = this.chatService.sayHi();
        console.log({ result });

        socket.emit("sayHi", result);
      } catch (error) {
        socket.emit("costum_error", error);
      }
    });
  };

  sendMessage=async(socket: IAuthSocket,io:Server)=>{
return socket.on("sendMessage",async ({sendTo,content}:{sendTo:string,content:string}) => {
  try {
    console.log({sendTo,content});
    await this.chatService.sendMessage({sendTo,content},socket.data.user);
   

    io.to(await this.redis.getSockets(socket.data.user._id)).emit("successMessage",{content,sendTo});
    const recieverSocketIds=await this.redis.getSockets(sendTo);
 if(recieverSocketIds?.length){
  socket.to(recieverSocketIds).emit("newMessage",{content,from:socket.data.user})
 }
  } 
  
  catch (error) {
    socket.emit("custom_error",error)
  }
})
  }

sendGroupMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on("sendGroupMessage", async ({ content, groupId }: { groupId: string, content: string }) => {
        try {
            console.log({ content, groupId });
           const roomId= await this.chatService.sendGroupMessage({ content, groupId }, socket.data.user)
            io.to(await this.redis.getSockets(socket.data.user._id)).emit("successMessage", { content, sendTo:groupId })
                            socket.to(roomId).emit("newMessage", { content, groupId})

        } catch (error) {
            console.log({ error });
            socket.emit("custom_error", error)
        }
    })
}


join_room = (socket: IAuthSocket, io: Server) => {
    return socket.on("join_room", async ({ roomId}: { roomId: string}) => {
        try {
socket.join(roomId)
            
        } catch (error) {
            console.log({ error });
            socket.emit("custom_error", error)
        }
    })
}

}
export const chatEvent = new ChatEvent();
