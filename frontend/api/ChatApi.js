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

    async addMembers(chatId, members) {
        return await api.put(`/chat/add-members/${chatId}`, { members });
    }

    async leaveChat(chatId){
        return await api.delete(`/chat/leave-chat/${chatId}`);
    }

    async editChat(chatId, body){
        return await api.put(`/chat/edit/${chatId}`, body);
    }

    async editRights(chatId, body){
        return await api.put(`/chat/edit-rights/${chatId}`, body);
    }
}

export default new ChatApi();