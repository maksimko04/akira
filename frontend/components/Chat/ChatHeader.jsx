import sunIcon from "@/assets/icons/sun.png";
import Image from "next/image"

import styles from "./chatHeader.module.scss";
import { useChat } from "../../providers/ChatContext";
import typesGroup from "../../constants/typesGroup";
import useMe from "../../hooks/useMe";
import { useEffect, useState } from "react";
import UserApi from "../../api/UserApi";

export default () => {
    const { selectedChat: chat } = useChat();

    const [user, loading] = useMe();
    const [additionalInfo, setAdditionalInfo] = useState("");

    useEffect(() => {
        if(!chat){
            return;
        }

        const getAdditionalInfo = async () => {
            if (chat.type === typesGroup.PRIVATE) {
                setAdditionalInfo("був колись в сеті...");
            }
            else {
                return setAdditionalInfo(`${chat.members.length} members`);
            }
        };

        getAdditionalInfo();
    }, [chat]);

    if (loading) {
        return null;
    }

    if (!chat) {
        return null;
    }

    return (<header className={styles.header}>
        <div>
            <p className={styles.title}>{chat.title}</p>
            <p className={styles.additional__info}>{additionalInfo}</p>
        </div>
    </header>);
}