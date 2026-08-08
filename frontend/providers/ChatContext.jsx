import { createContext, useContext, useState } from "react";
import MessageApi from "../api/MessageApi";
import { useEffect } from "react";
import { io, Socket } from 'socket.io-client';
import messageActions from "../constants/messageActions";
import { useRef } from "react";
import ScrollToElementWithLock from "../shared/ScrollToElementWithLock";
import typesChat from "../constants/typesChat";
import ChatApi from "../api/ChatApi";

const ChatContext = createContext(null);

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
let socket;

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [targetMessage, setTargetMessage] = useState(null);
    const textMessageRef = useRef(null);
    const messageBlockRef = useRef(null);
    const [focusedMessage, setFocusedMessage] = useState(null);
    const [chats, setChats] = useState([]);

    const openChat = async (chat) => {
        if (chat.uncreated) {
            setSelectedChat({
                title: chat.name,
                type: typesChat.PRIVATE,
                userId: chat.userId,
                uncreated: true
            })
            setMessages([]);
            socket.emit("open_uncreated_chat", { userId: chat.userId }, (data) => {
                socket.on("uncreated_chat_created", async (chat) => {
                    try {
                        setSelectedChat(chat);
                        setChats(prev => [chat, ...prev]);
                        const response = await MessageApi.getMessages(chat._id);
                        setMessages(response.data.messages);
                        socket.emit("join_chat", { chatId: chat._id });
                    }
                    catch {

                    }
                })
            });
            return;
        }

        try {
            const response = await MessageApi.getMessages(chat._id);
            socket.emit("join_chat", { chatId: chat._id });
            setSelectedChat(chat);
            setMessages(response.data.messages);
            socket.off("uncreated_chat_created");
        }
        catch (err) {
            return;
        }
    };

    const sendMessage = (text) => {
        if (!selectedChat) {
            return;
        }
        switch (targetMessage?.action) {
            case messageActions.edit: {
                socket.emit("edit_message", { chatId: selectedChat._id, messageId: targetMessage.messageId, text }, (response) => {
                    if (!response || !response.success) {
                        return;
                    }

                    setMessages(prev => prev.map(message => {
                        return message._id === targetMessage.messageId ? response.editedMessage : message;
                    }));

                    setTargetMessage(null);
                });
                break;
            };
            default: {
                socket.emit("send_message", { chatId: selectedChat._id, text, replied: targetMessage?.messageId }, (response) => {
                    if (response && response.success) {
                        setMessages(prev => [response.message, ...prev]);
                    }

                    setTargetMessage(null);
                });
            }
        }
    };

    const getMessage = (messageId) => {
        return messages.find(message => message._id === messageId);
    }

    const focusOnMessage = async (messageId) => {
        let message = document.getElementById(`message-${messageId}`);
        let needDeleteTemporaryMessages = false;
        if (!message) {
            const response = await MessageApi.getMessages(selectedChat._id, {
                direction: "both",
                limit: 20,
                offset: messageId
            })

            if (response) {
                const oldMessages = response.data.messages;
                const currentMessages = messages.map(message => ({ ...message, temp: true }));
                const combined = [...currentMessages, ...oldMessages];
                const combinedMassages = Array.from(
                    new Map(combined.map(msg => [msg._id, msg])).values()
                );
                combinedMassages.sort((message1, message2) => message1._id < message2._id);
                setMessages(combinedMassages);
                needDeleteTemporaryMessages = true;
            }
        }
        setFocusedMessage(messageId);
    }

    useEffect(() => {
        socket = io(SERVER_URL, {
            withCredentials: true,
        });

        socket.on("receive_message", message => {
            setMessages(prev => [message, ...prev]);
        });

        socket.on("edited_message", editedMessage => {
            setMessages(prev => prev.map(message => {
                return editedMessage._id === message._id ? editedMessage : message;
            }));
        });

        socket.on("deleted_chat", chatId => {
            setSelectedChat(prev => prev?._id === chatId ? null : prev);
            setChats(prev => prev.filter(chat => chat._id !== chatId));
        })

        const loadChats = async () => {
            try {
                const response = await ChatApi.getChats();
                setChats(response.data.chats);
            }
            catch { }
        };

        loadChats();

        return () => {
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        if (!focusedMessage) return;

        const message = document.getElementById(`message-${focusedMessage}`);

        if (!message) {

            setFocusedMessage(null);
            return;
        }

        ScrollToElementWithLock(messageBlockRef.current, message, (isSuccess, unlock) => {
            if (isSuccess) {
                message.classList.remove("focus__on");
                void message.offsetWidth;
                message.classList.add("focus__on");

                message.addEventListener('animationend', () => {
                    message.classList.remove("focus__on");
                }, { once: true });

                setTimeout(unlock, 300);
                setFocusedMessage(null);
                setMessages(prev => prev.filter(message => !message.temp));
            }
            else {
                unlock();
            }
        })
    }, [focusedMessage]);

    return (
        <ChatContext.Provider value={{
            messages,
            setMessages,
            selectedChat,
            setSelectedChat,
            openChat,
            sendMessage,
            socket,
            targetMessage,
            setTargetMessage,
            textMessageRef,
            getMessage,
            focusOnMessage,
            messageBlockRef,
            chats,
            setChats
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}