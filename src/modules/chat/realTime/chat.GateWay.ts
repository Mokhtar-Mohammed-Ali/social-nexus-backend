import { Server } from "socket.io";
import { IAuthSocket } from "../../../common/types/express.types";
import { chatEvent, ChatEvent } from "./chat.events";

export class ChatGateWay{
private chatEvent:ChatEvent
    constructor(){
this.chatEvent=chatEvent
    }

    registerEvents=(socket:IAuthSocket,io:Server)=>{
     this.chatEvent.sayHi(socket)
     this.chatEvent.sendMessage(socket,io)
     this.chatEvent.sendGroupMessage(socket,io)
     this.chatEvent.join_room(socket,io)
    }
}

export const chatGateWay=new ChatGateWay()