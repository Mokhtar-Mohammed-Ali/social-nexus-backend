import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../common/interfaces";
import { ChatRepository } from "../../DB/DataBaseRepository/chat.repository.";
import { toObjectId } from "../../common/utils/objectId";
import { NotFoundExpetions } from "../../common/exptions";
import { IChat } from "../../common/interfaces/chat.interface";
import { ChatEnum } from "../../common/enums";
import { userRepository } from "../../DB";
import { s3Service, S3Service } from "../../common/services";
import { randomUUID } from "node:crypto";

export class ChatService {
  private chatRepository: ChatRepository;
  private userRepository: userRepository;
  private s3service: S3Service;
  constructor() {
    this.chatRepository = new ChatRepository();
    this.userRepository = new userRepository();
    this.s3service = s3Service;
  }

  sayHi = () => {
    console.log("hello");
  };

  async getChat(
    participantId: string,
    user: HydratedDocument<IUser>,
    { page, size }: { page: string; size: string },
  ): Promise<IChat> {
    const chat = await this.chatRepository.findOneChat({
      filter: {
        participants: { $all: [user._id, toObjectId(participantId)] },
      },
      options: {
        populate: [{ path: "participants" }],
      },
      page,
      size,
    });
    if (!chat) {
      throw new NotFoundExpetions("fail to find yor chat");
    }
    return chat.toJSON();
  }
async getGroupChat(groupId: string, { page, size }: { page?: string, size?: string }, user: HydratedDocument<IUser>) {
    const chat = await this.chatRepository.findOneChat({
        filter: {
            _id: toObjectId(groupId),
            participants: { $in: [user._id] },
            type: ChatEnum.ovm
        },
        options: {
            populate: [{ path: 'participants' },{path:"messages.createdBy"}]
        },
        page,
        size
    })
    if (!chat) {
        throw new NotFoundExpetions("Fail to find Matching Conversation")
    }
    return chat.toJSON();
}


  async sendMessage(
    { sendTo, content }: { sendTo: string; content: string },
    user: HydratedDocument<IUser>,
  ): Promise<void> {
    let chat = await this.chatRepository.findOneAndUpdate({
      filter: {
        participants: { $all: [user._id, toObjectId(sendTo)] },
        type: ChatEnum.ovo,
      },
      update: {
        $addToSet: {
          messages: {
            content,
            createdBy: user._id,
          },
        },
      },
    });
    if (!chat) {
      chat = await this.chatRepository.createOne({
        data: {
          participants: [user._id, toObjectId(sendTo)],
          createdBy: user._id,
          type: ChatEnum.ovo,
          messages: [
            {
              content,
              createdBy: user._id,
            },
          ],
        },
      });
    }
  }
  async sendGroupMessage(
    { groupId, content }: { groupId: string; content: string },
    user: HydratedDocument<IUser>,
  ): Promise<string> {
    let chat = await this.chatRepository.findOneAndUpdate({
      filter: {
        _id:toObjectId(groupId),
        participants: { $in: [user._id, ] },
        type: ChatEnum.ovm,
      },
      update: {
        $addToSet: {
          messages: {
            content,
            createdBy: user._id,
          },
        },
      },
    });
    if (!chat) {
    throw new NotFoundExpetions("fail to find group chat")
    }
   return chat.roomId
  }

  async createGroup(
    {
      participantsIds = [],
      group,
    }: { participantsIds: string[] | Types.ObjectId[]; group: string },
    user: HydratedDocument<IUser>,
    file?: Express.Multer.File,
  ): Promise<IChat> {
    participantsIds = [
      ...new Set(
        participantsIds.map((ele) => {
          return toObjectId(ele as string);
        }),
      ),
    ];
    const users = await this.userRepository.find({
      filter: { _id: { $in: participantsIds }, friends: { $in: [user._id] } },
    });
    if (users.length != participantsIds.length) {
      throw new NotFoundExpetions("Fail to find all participants");
    }
    let group_image!: string;
    const roomId = randomUUID();
    const path = `chat/group/${roomId}`;
    if (file) {
      group_image = await this.s3service.uploadAsset({
        path,
        file,
      });
    }
    const chatingGroup = await this.chatRepository.createOne({
      data: {
        participants: [...participantsIds, user._id],
        createdBy: user._id,
        messages: [],
        type: ChatEnum.ovm,
        group,
        roomId,
        group_image,
      },
    });
    return chatingGroup.toJSON();
  }
}

export const chatService = new ChatService();
