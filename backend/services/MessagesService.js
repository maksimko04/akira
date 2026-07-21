import Message from "../schemas/MessageSchema.js";
import ApiError from "../models/ApiError.js";
import ChatService from "./ChatService.js";

class MessagesService {
    async createMessage(messageInfo){
        const {chatId, replied, authorId} = messageInfo;
        const chat = ChatService.getChat(chatId);

        if(!chat){
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        if(replied){
            const originalMessage = !await Message.findById(replied);
            if(!originalMessage || originalMessage.chat.toString() !== chatId.toString()){
                throw ApiError.badRequest("MESSAGE_NOT_EXISTS");
            }
        }

        return await Message.create({author, text, attachments, replied});
    }

    async getMessages(userId, filter, pagination){
        const {chatId, pattern, memberId} = filter;

        if(!await ChatService.checkMemberInChat(userId, chatId)){
            throw ApiError.forbidden();
        }

        if(memberId && !await ChatService.checkMemberInChat(memberId, chatId)){
            throw ApiError.badRequest("MEMBER_NOT_EXISTS");
        }

        const limit = pagination.limit || 20;
        const skip = pagination.skip || 0;

        const query = {chatId};

        if(pattern){
            query.text = {$regex: pattern, $options: "i"};
        }

        if(memberId){
            if(!await ChatService.checkMemberInChat(memberId, chatId)){
                throw ApiError.badRequest("MEMBER_NOT_EXISTS");
            }
            query.author = memberId;
        }

        const messages = await Message.find(query)
            .sort({ _id: -1})
            .limit(limit)
            .skip(skip);

        return messages;
    }
}

export default new MessagesService();