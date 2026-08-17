import api from "./AxiosInstance"

class ChatApi {
    async getChats(searchText) {
        const query = searchText ? `?searchText=${searchText}` : "";
        return await api.get("/chat" + query);
    }

    async createChat(body) {
        return await api.post("/chat/create", body)
    }

    async deleteChat(chatId) {
        return await api.delete(`/chat/${chatId}`);
    }

    async getMembersDetails(chatId, pagination) {
        return await api.get(`/chat/get-members/${chatId}`, {
            params: pagination
        })
    }

    async removeMember(chatId, memberId) {
        return await api.delete(`/chat/delete-member/${chatId}`, {
            data: { memberId }
        });
    }
}

export default new ChatApi();