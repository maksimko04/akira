import api from "./AxiosInstance"

class UserApi {
    async login({email, password}){
        return await api.post("/user/login", {email, password});
    }

    async registration({email, password, username, name}){
        return await api.post("/user/registration", {email, password, username, name});
    }

    async me(){
        return await api.get("/user/me");
    }

    async getUser(userId){
        return await api.get(`/user/${userId}`)
    }
}

export default new UserApi();