import { createContext, useContext, useState } from "react";
import MessageApi from "../api/MessageApi";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const openChat = async (chat) => {
        try {
            const response = await MessageApi.getChats(chat._id);
            setSelectedChat(chat);
            setMessages(response.data.messages);
        }
        catch (err) {
            return;
        }
    };

    const sendMessage = async (text) => {
        if(!selectedChat){
            return;
        }

        try{
            const response = await MessageApi.sendMessage(selectedChat._id, text);
            console.log(response.data.message)
            setMessages(prev => [response.data.message, ...prev]);
        }
        catch(err){
            return;
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            setMessages,  
            selectedChat,
            setSelectedChat,
            openChat,
            sendMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(){
    return useContext(ChatContext);
}