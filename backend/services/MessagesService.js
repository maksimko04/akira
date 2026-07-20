import Message from "../schemas/MessageSchema.js";
import ApiError from "../models/ApiError.js";

class MessagesService {
    async createMessage(author, text, attachments, replied){
        if(replied){
            if(!await Message.findById(replied)){
                throw ApiError.badRequest("MESSAGE_NOT_EXISTS");
            }
        }

        return await Message.create({author, text, attachments, replied});
    }

    async getMessages(limit, skip){
        limit = limit || 20;
        skip = skip || 0;
        const messages = await Message.find()
            .sort({ _id: -1})
            .limit(limit)
            .skip(skip);

        return messages;
    }
}

export default new MessagesService();