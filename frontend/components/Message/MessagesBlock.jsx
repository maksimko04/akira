import { useChat } from "../../providers/ChatContext";
import Message from "./Message";

import styles from "./messagesBlock.module.scss";

export default () => {
    const { messages } = useChat();

    return (<div className={styles.container}>
        {messages.map(message =>
            <Message key = {message._id} message={message}/>
        )}
    </div>)
};