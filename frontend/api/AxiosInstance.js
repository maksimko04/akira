import axios from 'axios';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const api = axios.create({ 
    baseURL: SERVER_URL + "/api",
    withCredentials: true,
});

api.interceptors.response.use(response => response.data);

export default api;