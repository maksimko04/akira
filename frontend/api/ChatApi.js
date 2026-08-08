import api from "./AxiosInstance"

class ChatApi {
    async getChats(searchText){
        const query = searchText ? `?searchText=${searchText}` : "";
        return await api.get("/chat" + query);
    }

    async createChat(body){
        return await api.post("/chat/create", body)
    }

    async deleteChat(chatId){
        return await api.delete(`/chat/${chatId}`);
    }
}

export default new ChatApi();