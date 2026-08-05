"use client"

import { useState } from "react"
import Chat from "../../components/Chat/Chat"
import ListChats from "../../components/Chat/ListChats"
import MessageApi from "../../api/MessageApi"
import { useRouter } from "next/navigation"
import useCheckAuth from "../../hooks/useCheckAuth"
import { ChatProvider } from "../../providers/ChatContext"

import styles from "./styles.module.scss";

export default () => {
    useCheckAuth();

    return (<ChatProvider>
        <div className={styles.container}>
            <ListChats />
            <Chat />
        </div>
    </ChatProvider>)
}