import api from "./AxiosInstance"

class MessageApi {
    async getMessages(chatId, pagination) {
        if (!pagination) {
            return api.get(`/message/${chatId}`);
        }

        const { direction, limit, offset } = pagination;

        if (direction && !["above", "below", "both"].includes(direction)) {
            throw new Error(`Invalid direction: ${direction}`);
        }

        const params = new URLSearchParams();

        if (direction) params.append("direction", direction);
        if (limit) params.append("limit", limit);
        if (offset) params.append("offset", offset);

        const queryString = params.toString() ? `?${params.toString()}` : "";

        return api.get(`/message/${chatId}${queryString}`);
    }

    async sendMessages(chatId, text) {
        return await api.post("/message/create", {
            chatId, text
        });
    }

    async deleteMessage(messageId){
        return await api.delete(`/message/${messageId}`)
    }

    async uploadAttachments(formData){
        return await api.post("/message/upload-attachments", formData);
    }
}

export default new MessageApi();