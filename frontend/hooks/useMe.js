"use client"

import { useEffect, useState } from "react";
import UserApi from "../api/UserApi";
import { useAuthStore } from "../store/useAuthStore"

export default () => {
    const user = useAuthStore(state => state.user);
    const setUser = useAuthStore(state => state.setUser);
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        if(!user){
            const fetchUser = async () => {
                try{
                    const response = await UserApi.me();
                    setUser(response.data.user._id);
                }
                catch(err){}
                finally{
                    setLoading(false);
                }
            }
            fetchUser();
        }
    }, []);

    return [user, loading, setUser];
}