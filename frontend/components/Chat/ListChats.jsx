"use client"

import { useEffect, useState } from "react";
import ChatApi from "../../api/ChatApi";
import Image from "next/image";

import styles from "./listChats.module.scss"
import { useChat } from "../../providers/ChatContext";
import UserApi from "../../api/UserApi";
import Avatar from "../general/Avatar";
import { groupAvatarsStorage } from "../../constants/fileBackets";

export default (props) => {
    const { search, type } = props;
    const { openChat, selectedChat, chats, setChats } = useChat();
    const [displayedChats, setDisplayedChats] = useState([]);

    useEffect(() => {
        const getChats = async () => {
            try {
                if (type) {
                    if (type === "global") {
                        try {
                            const response = await UserApi.globalSearch(search);
                            setDisplayedChats(response.data.users);
                        }
                        catch { }
                    }
                    else {
                        try {
                            const response = await ChatApi.getChats(search);
                            setDisplayedChats(response.data.chats);
                        }
                        catch { }
                    }
                }
                else {
                    setDisplayedChats(chats);
                }
            }
            catch (err) {

            }
        }
        getChats();
    }, [search]);

    useEffect(() => {
        if(!type){
            setDisplayedChats(chats);
        }
    }, [chats]);

    let getChatInfo = (obj, info) => {
        switch(info){
            case "title": {
                return type === "global" ? obj.name : obj.title;
            }
            case "additinalInfo": {
                return type === "global" ? "@" + obj.username : obj.lastMessage;
            }
        }
    }

    return (<div className={styles.container}>
        {type === "global" &&
            <div className={styles.separated__label}>
                <p>Global search:</p>
            </div>
        }
        {
            displayedChats.map(chat =>
                <button onClick={() => openChat(type === "global" ? {uncreated: true, name: chat.name, userId: chat._id} : chat)}
                    className={`${styles.chat} ${selectedChat && chat._id === selectedChat._id && styles.selected__chat}`}
                    key={chat._id}>
                    <Avatar onlyView={true} defaultImage={chat.avatar && groupAvatarsStorage + chat.avatar} 
                    additionalInfo={chat.title} fontSize="36px" />
                    <div className={styles.text__info}>
                        <p>{getChatInfo(chat, "title")}</p>
                        <p className={styles.additional__info}>{getChatInfo(chat, "additinalInfo")}</p>
                    </div>
                </button>
            )
        }</div>);
};