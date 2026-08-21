"use client"

import sendIcon from "@/assets/icons/send.png";
import Image from "next/image";

import styles from "./chat.module.scss";
import useMe from "@/hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import MessagesBlock from "../Message/MessagesBlock";
import ChatHeader from "./ChatHeader";
import { useState } from "react";
import ChatApi from "../../api/ChatApi";
import typesChat from "../../constants/typesChat";
import { useEffect } from "react";
import { useRef } from "react";
import { checkRight, rights } from "../../shared/ChatRights";
import ChatControlPannel from "@/components/ControlPannel/ChatControlPannel";

export default (props) => {
    const [user, isLoading] = useMe();
    const { openChat, selectedChat, setSelectedChat, sendMessage, targetMessage, textMessageRef, socket } = useChat();
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
    const messageToUncreatedChat = useRef(false);

    const onSubmit = async event => {
        event.preventDefault();
        if (selectedChat.uncreated) {
            try {
                const response = await ChatApi.createChat({
                    type: typesChat.PRIVATE,
                    members: [selectedChat.userId]
                });

                socket.emit("created_private_chat", { userId: selectedChat.userId });

                openChat(response.data.chat);

                messageToUncreatedChat.current = true;
            }
            catch { }
            return;
        }

        sendMessage(textMessageRef.current.value);
        textMessageRef.current.value = "";
    }

    useEffect(() => {
        if (messageToUncreatedChat.current) {
            sendMessage(textMessageRef.current.value);
            textMessageRef.current.value = "";
            messageToUncreatedChat.current = false;
        }

        setIsControlPanelOpen(false)
    }, [selectedChat?._id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            setIsControlPanelOpen(false);
        };

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    if (isLoading) {
        return null;
    }

    return (<div className={styles.container}>
        {
            selectedChat ?
                <>
                    <ChatHeader setIsControlPanelOpen={setIsControlPanelOpen} />
                    <MessagesBlock />
                    {(selectedChat.uncreated || checkRight(selectedChat.myMember, rights.MEMBER.SEND_MESSAGES)) &&
                        <form onSubmit={onSubmit} className={styles.sending__area}>
                            <div className={styles.writing__area}>
                                {targetMessage &&
                                    <div className={styles.action__description}>
                                        <p className={styles.action__title}>{targetMessage.description}</p>
                                        <p className={styles.action__message__text}>{targetMessage.text}</p>
                                    </div>}
                                <input ref={textMessageRef} />
                            </div>
                            <button className={styles.button__send}>
                                <Image src={sendIcon} alt="sent" />
                            </button>
                        </form>
                    }
                </>
                :
                <div className={styles.no__chat__info}>
                    <p>Select a chat to start a messaging</p>
                </div>
        }

        {selectedChat && isControlPanelOpen &&
            <ChatControlPannel setIsControlPanelOpen={setIsControlPanelOpen} />
        }
    </div>);
}