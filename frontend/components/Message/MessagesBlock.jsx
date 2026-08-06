import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChat } from "../../providers/ChatContext";
import Message from "./Message";

import styles from "./messagesBlock.module.scss";
import ContextMenuMessage from "./ContextMenuMessage";
import MessageApi from "../../api/MessageApi";

export default () => {
    const { messages, setMessages, selectedChat, messageBlockRef } = useChat();
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
            message
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
                if(response.data.messages.length === 0){
                    return;
                }
                if(!isAbove){
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
        if(offsetScroll.current) {
            console.log(messageBlockRef.current.scrollHeight - offsetScroll.current);
            messageBlockRef.current.scrollTop = offsetScroll.current - messageBlockRef.current.scrollHeight;
            offsetScroll.current = null;
        }
        const topSentinel = topSentinelRef.current;
        const bottomSetinel = bottomSentielRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if(isLoadingMesasgeRef.current){
                    return;
                }
                entries.forEach(entry => {
                    if(entry.target === topSentinel && entry.isIntersecting){
                        loadOtherMessages(true);
                    }

                    if(entry.target === bottomSetinel && entry.isIntersecting){
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

    useEffect(() => {
        console.log("height: ", messageBlockRef.current.scrollHeight);
        console.log("top: ", messageBlockRef.current.scrollTop);
    })

    useEffect(() => {
        setInterval(() => {
            console.log("height: ", messageBlockRef.current.scrollHeight);
            console.log("top: ", messageBlockRef.current.scrollTop);
        }, 1000)
    }, [])

    return (<> <div ref={messageBlockRef} className={styles.container}>
        <div ref={bottomSentielRef} style={{ height: '1px' }}></div>
        {messages.map(message =>
            <Message onContextMenu={openContextMenu} key={message._id} message={message} />
        )}
        <div ref={topSentinelRef} style={{ height: '1px' }} />
    </div>
        {
            infoContextMenu &&
            <ContextMenuMessage info={infoContextMenu} />
        }
    </>)
};