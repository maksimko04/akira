import api from "./AxiosInstance"

class ChatApi {
    async getChats(){
        return await api.get("/chat/");
    }
}

export default new ChatApi();