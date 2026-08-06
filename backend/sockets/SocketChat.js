import ChatService from "../services/ChatService.js";
import { z } from "zod"
import MessagesService from "../services/MessagesService.js";

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

            callback?.({ success: true, message });
        }
        catch (error) {
            callback?.({ success: false, error: error.message });
        }
    });

    socket.on('edit_message', async (data, callback) => {
        try {
            const { chatId, messageId, text } = messageEditSchema.parse(data);
            const editedMessage = await MessagesService.editMessage(socket.user.id, messageId, text);

            io.to(`chat_${chatId}`).except(socket.id).emit("edited_message", editedMessage);

            callback?.({ success: true, editedMessage });
        }
        catch (error) {
            callback?.({ success: false, error: error.message });
        }
    });
}