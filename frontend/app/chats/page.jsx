"use client"

import Chat from "../../components/Chat/Chat"
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