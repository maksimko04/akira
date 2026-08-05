import typesChat from "../../constants/typesChat";
import useMe from "../../hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import styles from "./message.module.scss"

export default (props) => {
    const { message, onContextMenu } = props;
    const [user, isLoading] = useMe();

    const { selectedChat, getMessage, focusOnMessage } = useChat();

    if (isLoading) {
        return null;
    }

    const repliedMessage = message.replied && getMessage(message.replied);

    const getTimeInDay = (time) => {
        return new Intl.DateTimeFormat('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(time));
    }

    return (
        <div id={`message-${message._id}`} onContextMenu={(event) => onContextMenu(event, message)}
            className={`${styles.message} ${message.author._id === user ? styles.my__message : styles.other__message}`}
            key={message._id}>
            { selectedChat.type !== typesChat.PRIVATE && message.author._id !== user && 
                <p className={styles.author}>{message.author.name}</p>
            }
            {repliedMessage &&
                <div onClick={() => focusOnMessage(repliedMessage._id)} className={styles.replied__section}>
                    <p className={styles.original__author}>{repliedMessage.author.name}</p>
                    <p className={styles.original__text}>{repliedMessage.text}</p>
                </div>
            }
            <div className={styles.content__message}>
                <p className={styles.text}>{message.text}</p>
                {message.edited && <p className={styles.mark_info}>edited</p>}
                <p className={styles.mark_info}>{getTimeInDay(message.createdAt)}</p>
            </div>
        </div>
    )
};