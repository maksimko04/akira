import { useEffect, useLayoutEffect, useRef, useState, Fragment } from "react";
import { useChat } from "../../providers/ChatContext";
import Message from "./Message";

import styles from "./messagesBlock.module.scss";
import MessageApi from "../../api/MessageApi";
import GetFormatDate from "../../shared/GetFormatDate";
import SpecialMessage from "./SpecialMessage";
import ContextMenu from "@/components/general/ContextMenu.jsx";
import messageActions from "../../constants/messageActions.js";

const contextMenuActions = [
    {
        text: "Edit",
        hideWhen: (user, {message}) => {
            return user !== message.author._id;
        },

        action: ({message, setTargetMessage, textMessageRef}) => {
            textMessageRef.current.focus();
            textMessageRef.current.value = message.text;
            setTargetMessage({
                action: messageActions.edit,
                messageId: message._id,
                description: "Edit message",
                text: message.text
            });
        }
    },
    {
        text: "Copy message",
        action: ({message}) => {
            navigator.clipboard.writeText(message.text);
        }
    },
    {
        text: "Reply",
        action: ({message, setTargetMessage, textMessageRef}) => {
            textMessageRef.current.focus();
            setTargetMessage({
                action: messageActions.reply,
                messageId: message._id,
                description: `Reply to ${message.author.name}`,
                text: message.text
            });
        }
    }
];

export default () => {
    const { messages, setMessages, selectedChat, messageBlockRef, setTargetMessage, textMessageRef } = useChat();
    const [infoContextMenu, setInfoContextMenu] = useState(null);

    const topSentinelRef = useRef(null);
    const bottomSentielRef = useRef(null);

    const offsetScroll = useRef(null);

    const openContextMenu = (event, message) => {
        event.preventDefault();
        event.stopPropagation();
        setInfoContextMenu({
            pos: {
                x: event.clientX,
                y: event.clientY
            },
            data: {
                message,
                setTargetMessage,
                textMessageRef
            }
        });
    }

    const closeContextMenu = (event) => {
        setInfoContextMenu(null);
    }

    const isLoadingMesasgeRef = useRef(false);

    const loadOtherMessages = async (isAbove) => {
        isLoadingMesasgeRef.current = true;
        try {
            const response = await MessageApi.getMessages(selectedChat._id, {
                direction: isAbove ? "above" : "below",
                offset: messages[isAbove ? messages.length - 1 : 0]._id,
                limit: 30
            });

            isLoadingMesasgeRef.current = false;

            if (response) {
                if (response.data.messages.length === 0) {
                    return;
                }
                if (!isAbove) {
                    offsetScroll.current = messageBlockRef.current.scrollHeight + messageBlockRef.current.scrollTop;
                }
                const newMessages = response.data.messages;
                setMessages(prev => {
                    const combined = isAbove
                        ? [...prev, ...newMessages]
                        : [...newMessages, ...prev];
                    return Array.from(new Map(combined.map(msg => [msg._id, msg])).values()).sort();
                });
            }
        }
        finally {
            isLoadingMesasgeRef.current = false;
        }
    }

    useEffect(() => {
        window.addEventListener("click", closeContextMenu);
        window.addEventListener("contextmenu", closeContextMenu);
    }, []);

    useLayoutEffect(() => {
        if (offsetScroll.current) {
            messageBlockRef.current.scrollTop = offsetScroll.current - messageBlockRef.current.scrollHeight;
            offsetScroll.current = null;
        }
        const topSentinel = topSentinelRef.current;
        const bottomSetinel = bottomSentielRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isLoadingMesasgeRef.current || messages.length === 0) {
                    return;
                }
                entries.forEach(entry => {
                    if (entry.target === topSentinel && entry.isIntersecting) {
                        loadOtherMessages(true);
                    }

                    if (entry.target === bottomSetinel && entry.isIntersecting) {
                        loadOtherMessages(false);
                    }
                });
            },
            {
                rootMargin: '100px 0px 0px 0px',
            });

        observer.observe(topSentinel);
        observer.observe(bottomSetinel);

        return () => {
            observer.disconnect();
        }
    }, [messages]);

    let date = GetFormatDate(messages?.[0]?.createdAt);

    return (<> <div ref={messageBlockRef} className={styles.container}>
        <div ref={bottomSentielRef} style={{ height: '1px' }}></div>
        {messages.map((message, index) => {
            let messageDate = GetFormatDate(message.createdAt);
            let showDate = null;
            if (date !== messageDate || index === messages.length - 1) {
                showDate = date;
                date = messageDate;
            }
            return <Fragment key={message._id}>
                <Message onContextMenu={openContextMenu} message={message} />
                {showDate && <SpecialMessage text={showDate}/>}
            </ Fragment>
        })}
        <div ref={topSentinelRef} style={{ height: '1px' }} />
    </div>
        {
            infoContextMenu &&
            <ContextMenu actions={contextMenuActions} info={infoContextMenu} />
        }
    </>)
};