import api from "./AxiosInstance"

class MessageApi {
    async getChats(chatId){
        return await api.get(`/message/${chatId}`);
    }

    async sendMessage(chatId, text){
        return await api.post("/message/create", {
            chatId, text
        });
    }
}

export default new MessageApi();