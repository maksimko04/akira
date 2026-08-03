"use client"

import sendIcon from "@/assets/icons/send.png";
import Image from "next/image";

import styles from "./chat.module.scss";
import useMe from "@/hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import MessagesBlock from "../Message/MessagesBlock";
import ChatHeader from "./ChatHeader";
import { useRef } from "react";

export default (props) => {
    const [user, isLoading] = useMe();
    const { selectedChat, sendMessage } = useChat();
    const textMessageRef = useRef(null);

    if (isLoading) {
        return null;
    }

    const onSubmit = event => {
        event.preventDefault();
        sendMessage(textMessageRef.current.value)
        textMessageRef.current.value = "";
    }

    return (<div className={styles.container}>
        {
            selectedChat ?
                <>
                    <ChatHeader />
                    <MessagesBlock />
                    <form onSubmit={onSubmit} className={styles.sending__area}>
                        <input ref={textMessageRef}/>
                        <button className = {styles.button__send}>
                            <Image src={sendIcon} alt="sent" />
                        </button>
                    </form>
                </>
                :
                <div className={styles.no__chat__info}>
                    <p>Select a chat to start a messaging</p>
                </div>
        }


    </div>);
}