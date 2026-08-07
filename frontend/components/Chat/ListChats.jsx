"use client"

import { useEffect, useState } from "react";
import ChatApi from "../../api/ChatApi";
import Image from "next/image";

import styles from "./listChats.module.scss"
import sunIcon from "@/assets/icons/sun.png";
import { useChat } from "../../providers/ChatContext";

export default () => {
    const { openChat, selectedChat } = useChat();
    console.log(selectedChat);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const getChats = async () => {
            try {
                const response = await ChatApi.getChats();
                setChats(response.data.chats);
            }
            catch (err) {

            }
        }
        getChats();
    }, []);

    return (<div className={styles.container}>
        
        {
            chats.map(chat =>
                <button onClick={() => openChat(chat)}
                className={`${styles.chat} ${selectedChat && chat._id === selectedChat._id && styles.selected__chat}`}
                key={chat._id}>
                    <Image src={sunIcon} alt="sun" />
                    <div>
                        <p>{chat.title}</p>
                        <p>No messages</p>
                    </div>
                </button>
            )
        }</div>);
};