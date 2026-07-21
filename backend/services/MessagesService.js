import Message from "../schemas/MessageSchema.js";
import ApiError from "../models/ApiError.js";
import ChatService from "./ChatService.js";
import MemberRights from "../models/MemberRights.js";

class MessagesService {
    async createMessage(messageInfo){
        const {chatId, text, replied, authorId, attachments} = messageInfo;
        const chat = await ChatService.getChat(chatId);

        if(!chat){
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const member = await ChatService.findMember(chat, authorId);
        if(!member){
            throw ApiError.forbidden();
        }   

        if(!ChatService.checkRight(member, MemberRights.MEMBER.SEND_MESSAGES)){
            throw ApiError.forbidden();
        }

        if(replied){
            const originalMessage = !await Message.findById(replied);
            if(!originalMessage || originalMessage.chat.toString() !== chatId.toString()){
                throw ApiError.badRequest("MESSAGE_NOT_EXISTS");
            }
        }

        return await Message.create({
            chat: chatId,
            author: authorId,
            text: text,
            replied: replied,
            attachments: attachments,
        });
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

        const query = {chat: chatId};

        if(pattern){
            query.text = {$regex: pattern, $options: "i"};
        }

        if(memberId){
            if(!await ChatService.checkMemberInChat(memberId, chatId)){
                throw ApiError.badRequest("MEMBER_NOT_EXISTS");
            }
            query.author = memberId;
        }

        console.log(query);
        const messages = await Message.find(query)
            .sort({ _id: -1})
            .limit(limit)
            .skip(skip);

        return messages;
    }
}

export default new MessagesService();