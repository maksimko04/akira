import axios from "axios"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

class UserApi {
    async login(email, password){
        return await axios.post(SERVER_URL + "/api/user/login", {email, password})
    }
}

export default new UserApi();