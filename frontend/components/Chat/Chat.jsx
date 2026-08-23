"use client"

import styles from "./chat.module.scss";
import useMe from "@/hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import MessagesBlock from "../Message/MessagesBlock";
import ChatHeader from "./ChatHeader";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { checkRight, rights } from "../../shared/ChatRights";
import ChatControlPannel from "@/components/ControlPannel/ChatControlPannel";
import SendAreaMessage from "../Message/SendAreaMessage";

export default (props) => {
    const [user, isLoading] = useMe();
    const { selectedChat, sendMessage, textMessageRef } = useChat();
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
    const messageToUncreatedChat = useRef(false);

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
                        <SendAreaMessage />
                    }
                </>
                :
                <div className={styles.no__chat__info}>
                    <p>Select a chat to start a messaging</p>
                </div>
        }

        {isControlPanelOpen &&
            <ChatControlPannel setIsControlPanelOpen={setIsControlPanelOpen} />
        }
    </div>);
}