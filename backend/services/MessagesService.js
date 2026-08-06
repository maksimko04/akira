import Message from "../schemas/MessageSchema.js";
import ApiError from "../models/ApiError.js";
import ChatService from "./ChatService.js";
import MemberRights from "../models/MemberRights.js";

class MessagesService {
    async createMessage(messageInfo) {
        const { chatId, text, replied, authorId, attachments } = messageInfo;
        const chat = await ChatService.getChat(chatId);

        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const member = await ChatService.findMember(chat, authorId);
        if (!member) {
            throw ApiError.forbidden();
        }

        if (!ChatService.checkRight(member, MemberRights.MEMBER.SEND_MESSAGES)) {
            throw ApiError.forbidden();
        }

        if (replied) {
            const originalMessage = await Message.findById(replied);
            if (!originalMessage || originalMessage.chat.toString() !== chatId.toString()) {
                throw ApiError.badRequest("MESSAGE_NOT_EXISTS");
            }
        }

        const message = await Message.create({
            chat: chatId,
            author: authorId,
            text: text,
            replied: replied,
            attachments: attachments,
        });

        return await message.populate([
            { path: "author", select: "name" },
            {
                path: "replied",
                select: "text author",
                populate: { path: "author", select: "name" }
            }
        ]);
    }

    async getMessage(messageId) {
        return await Message
            .findById(messageId)
            .populate([
                { path: "author", select: "name" },
                {
                    path: "replied",
                    select: "text author",
                    populate: { path: "author", select: "name" }
                }
            ]);
    }

    async getMessages(userId, filter, pagination) {
        const { chatId, pattern, memberId } = filter;

        if (!await ChatService.checkMemberInChat(userId, chatId)) {
            throw ApiError.forbidden();
        }

        const limit = pagination.limit || 20;
        const directionPagination = pagination.direction;

        const query = { chat: chatId };

        if (pattern) {
            query.text = { $regex: pattern, $options: "i" };
        }

        if (memberId) {
            if (!(memberId === userId) && !await ChatService.checkMemberInChat(memberId, chatId)) {
                throw ApiError.badRequest("MEMBER_NOT_EXISTS");
            }
            query.author = memberId;
        }

        let olderMessages = [];
        let newerMessages = [];
        let markMessageArray = [];

        const queryExecute = async (additionalQuery = {}, sortDirection = -1) =>
            await Message.find({
                ...query,
                ...additionalQuery
            })
                .sort({ _id: sortDirection })
                .limit(limit)
                .populate([
                    { path: "author", select: "name" },
                    {
                        path: "replied",
                        select: "text author",
                        populate: { path: "author", select: "name" }
                    }
                ]);

        if (directionPagination) {
            const offsetMessage = pagination.offset;

            if (offsetMessage) {

                switch (directionPagination) {
                    case "both": {
                        let markMessage;
                        [newerMessages, markMessage, olderMessages] = await Promise.all([
                            queryExecute({ _id: { $gt: offsetMessage } }, 1),
                            await Message.findById(offsetMessage).populate("author", "name"),
                            queryExecute({ _id: { $lt: offsetMessage } })
                        ])
                        newerMessages.reverse();
                        if (markMessage) {
                            markMessageArray = [markMessage];
                        }
                        break;
                    }
                    case "below": {
                        newerMessages = await queryExecute({ _id: { $gt: offsetMessage } }, 1);
                        newerMessages.reverse();
                        break;
                    }
                    case "above": {
                        olderMessages = await queryExecute({ _id: { $lt: offsetMessage } });
                        break;
                    }
                }
            }
            else {
                throw ApiError.badRequest("INVALID_PAGINATION");
            }
        }
        else {
            newerMessages = await queryExecute();
        }

        return [...newerMessages, ...markMessageArray, ...olderMessages];
    }

    async deleteMessage(userId, messageId) {
        const message = await this.getMessage(messageId);

        if (!message) {
            throw ApiError.badRequest("MESSAGE_NOT_EXISTS");
        }

        const chat = await ChatService.getChat(message.chat);

        if (!chat) {
            throw ApiError.internal();
        }

        const member = await ChatService.findMember(userId);

        if (!member) {
            throw ApiError.forbidden();
        }

        if (message.author.toString() === userId.toString()) {
            if (!ChatService.checkRight(MemberRights.MEMBER.DELETE_OWN_MESSAGES)) {
                throw ApiError.forbidden();
            }

            await Message.findByIdAndDelete(messageId);
        }
        else {
            if (!ChatService.checkRight(MemberRights.ADMIN.DELETE_MESSAGES)) {
                throw ApiError.forbidden();
            }

            await Message.findByIdAndDelete(messageId);
        }
    }

    async editMessage(userId, messageId, text) {
        const message = await this.getMessage(messageId);

        if (!message) {
            throw ApiError.badRequest("MESSAGE_NOT_EXISTS");
        }

        const chat = await ChatService.getChat(message.chat);

        if (!chat) {
            throw ApiError.internal();
        }

        const member = await ChatService.findMember(chat, userId);

        if (!member) {
            throw ApiError.forbidden();
        }

        if (message.author._id.toString() === userId.toString()) {
            if (!ChatService.checkRight(member, MemberRights.MEMBER.EDIT_OWN_MESSAGES)) {
                throw ApiError.forbidden();
            }

            message.text = text;
            message.edited = true;
            await message.save();
            return message
                .populate([
                    { path: "author", select: "name" },
                    {
                        path: "replied",
                        select: "text author",
                        populate: { path: "author", select: "name" }
                    }
                ]);
        }
    }
}

export default new MessagesService();