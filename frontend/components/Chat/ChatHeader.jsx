import sunIcon from "@/assets/icons/sun.png";
import Image from "next/image"

import styles from "./chatHeader.module.scss";
import { useChat } from "../../providers/ChatContext";
import typesGroup from "../../constants/typesChat";
import useMe from "../../hooks/useMe";
import { useEffect, useRef, useState } from "react";
import UserApi from "../../api/UserApi";
import memberRoles from "../../constants/memberRoles";
import ChatApi from "../../api/ChatApi";
import responseStatuses from "../../constants/responseStatuses";
import ContextMenu from "@/components/general/ContextMenu.jsx";
import { Bars } from "@gravity-ui/icons"
import { Icon } from '@gravity-ui/uikit';

const actions = [
    {
        text: "delete Group",
        hideWhen: (user, { chat }) => {
            for (const member of chat.members) {
                if (member.user === user._id) {
                    return member.role !== MemberRoles.OWNER;
                }
            }
        },
        action: async ({ setChats, setSelectedChat, chat }) => {
            try {
                const response = await ChatApi.deleteChat(chat._id);
                if (response.status === responseStatuses.success) {
                    setSelectedChat(null);
                    setChats(prev => prev.filter(chatTemp => chatTemp._id !== chat._id));
                }
            }
            catch { }
        }
    }
]

export default (props) => {
    const {setIsControlPanelOpen} = props;
    const { chats, setChats, setSelectedChat, selectedChat } = useChat();

    const [user, loading] = useMe();
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [infoContextMenu, setInfoContextMenu] = useState(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!selectedChat) {
            return;
        }

        const getAdditionalInfo = async () => {
            if (selectedChat.type === typesGroup.PRIVATE) {
                setAdditionalInfo("був колись в сеті...");
            }
            else {
                return setAdditionalInfo(`${selectedChat.members.length} members`);
            }
        };

        getAdditionalInfo();
    }, [selectedChat]);

    const closeContextMenu = () => {
        setInfoContextMenu(null);
    }

    useEffect(() => {
        window.addEventListener("click", closeContextMenu);
        window.addEventListener("contextmenu", closeContextMenu);
    }, []);

    if (loading) {
        return null;
    }

    if (!selectedChat) {
        return null;
    }

    const switchContextMenu = (event) => {
        event.stopPropagation();
        if (infoContextMenu === null) {
            setInfoContextMenu({
                data: {
                    setChats,
                    setSelectedChat,
                    chat: selectedChat
                }
            });
        }
        else {
            setInfoContextMenu(null);
        }
    }


    return (<header onClick={() => setIsControlPanelOpen(prev => !prev)} className={styles.header}>
        <div className={styles.text__info}>
            <p className={styles.title}>{selectedChat.title}</p>
            <p className={styles.additional__info}>{additionalInfo}</p>
        </div>
        <button onClick={switchContextMenu} className={styles.menu__button}><Icon data={Bars} className="hover__icon" /></button>
        {infoContextMenu && <ContextMenu actions={actions} className={styles.context__menu__pos} info={infoContextMenu} />}
    </header>);
}