import ChatService from "../services/ChatService.js";
import { z } from "zod"
import MessagesService from "../services/MessagesService.js";
import UserService from "../services/UserService.js";

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const chatIdSchema = z.object({
    chatId: z.string().regex(mongoIdRegex, "INVALID_ID")
});

const messageSchema = z.object({
    chatId: z.string().regex(mongoIdRegex, "INVALID_ID"),
    text: z.string(),
    replied: z.string().regex(mongoIdRegex, "INVALID_ID").optional(),
});

const messageEditSchema = z.object({
    text: z.string(),
    messageId: z.string().regex(mongoIdRegex, "INVALID_ID"),
    chatId: z.string().regex(mongoIdRegex, "INVALID_ID")
});

const userIdSchema = z.object({
    userId: z.string().regex(mongoIdRegex, "INVALID_ID")
});

export default (io, socket) => {
    socket.on("join_chat", async (data, callback) => {
        try {
            const { chatId } = chatIdSchema.parse(data);
            if (!await ChatService.checkMemberInChat(socket.user.id, chatId)) {
                callback?.({ success: false, error: "FORBIDDEN" });
                return;
            }
            socket.join(`chat_${chatId}`);
            callback?.({ success: true });
        }
        catch (error) {
            callback?.({ success: false, error: error.message });
        }
    });

    socket.on("leave_chat", (data) => {
        try {
            const { chatId } = chatIdSchema.parse(data);
            socket.leave(`chat_${chatId}`);
        }
        catch { }
    });

    socket.on("send_message", async (data, callback) => {
        try {
            const { chatId, text, replied } = messageSchema.parse(data);

            const message = await MessagesService.createMessage({ chatId, text, replied, authorId: socket.user.id });

            io.to(`chat_${chatId}`).except(socket.id).emit("receive_message", message);

            const chat = await ChatService.getChat(chatId);

            chat.members.forEach(member => {
                io.to(`user_${member.user}`).emit("last_message_updated", { chatId, messageText: message.text, isChatActivity: true });
            })

            callback?.({ success: true, message });
        }
        catch (error) {
            callback?.({ success: false, error: error.message });
        }
    });

    socket.on("edit_message", async (data, callback) => {
        try {
            const { chatId, messageId, text } = messageEditSchema.parse(data);
            const editedMessage = await MessagesService.editMessage(socket.user.id, messageId, text);

            io.to(`chat_${chatId}`).except(socket.id).emit("edited_message", editedMessage);

            if (editedMessage.isLastMessage) {
                const chat = await ChatService.getChat(chatId);
                chat.members.forEach(member => {
                    io.to(`user_${member.user}`).emit("last_message_updated", { chatId, messageText: editedMessage.text });
                })
            }

            callback?.({ success: true, editedMessage });
        }
        catch (error) {
            callback?.({ success: false, error: error.message });
        }
    });

    socket.on("open_uncreated_chat", async (data, callback) => {
        try {
            const { userId } = userIdSchema.parse(data);

            await UserService.getUser(userId);

            socket.join(`uncreated_chat_${[socket.user.id, userId].sort().join(".")}`);
            callback?.({ success: true });
        }
        catch (error) {
            callback?.({ success: false, error: error.message });
        }
    });

    socket.on("created_private_chat", async (data, callback) => {
        const { userId } = userIdSchema.parse(data);

        const chat = await ChatService.findPrivateChat(socket.user.id, userId);

        const roomName = `uncreated_chat_${[socket.user.id, userId].sort().join(".")}`;

        io.to(roomName).except(socket.id).emit("uncreated_chat_created", chat);

        io.in(roomName).socketsLeave(roomName);

        callback?.({ success: true });
    })
}