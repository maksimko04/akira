"use client"

import { useState } from "react"
import Chat from "../../components/Chat/Chat"
import ListChats from "../../components/Chat/ListChats"
import MessageApi from "../../api/MessageApi"
import { useRouter } from "next/navigation"
import useCheckAuth from "../../hooks/useCheckAuth"
import { ChatProvider } from "../../providers/ChatContext"

import styles from "./styles.module.scss";
import SideMenu from "../../components/Chat/SideMenu"

export default () => {
    useCheckAuth();

    return (<ChatProvider>
        <div className={styles.container}>
            <SideMenu />
            <Chat />
        </div>
    </ChatProvider>)
}