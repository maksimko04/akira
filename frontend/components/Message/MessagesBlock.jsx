import { useState } from "react";
import { useChat } from "../../providers/ChatContext";
import Message from "./Message";

import styles from "./messagesBlock.module.scss";
import ContextMenuMessage from "./ContextMenuMessage";
import { useEffect } from "react";

export default () => {
    const { messages } = useChat();
    const [infoContextMenu, setInfoContextMenu] = useState(null);

    const openContextMenu = (event, message) => {
        event.preventDefault();
        event.stopPropagation();
        setInfoContextMenu({
            pos: {
                x: event.clientX,
                y: event.clientY
            },
            message
        });
    }

    const closeContextMenu = (event) => {
        setInfoContextMenu(null);
    }

    useEffect(() => {
        window.addEventListener("click", closeContextMenu);
        window.addEventListener("contextmenu", closeContextMenu);
    }, []);

    return (<><div className={styles.container}>
        {messages.map(message =>
            <Message onContextMenu={openContextMenu} key={message._id} message={message} />
        )}
    </div>
        {
            infoContextMenu &&
            <ContextMenuMessage info={infoContextMenu} />
        }
    </>)
};