import { forwardRef, useImperativeHandle, useState } from "react";
import { chatAttachmentsStorage } from "../../constants/fileBackets";
import typesChat from "../../constants/typesChat";
import useMe from "../../hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import styles from "./message.module.scss"
import { File } from "@gravity-ui/icons";
import { Icon } from "@gravity-ui/uikit";

const getTimeInDay = (time) => {
    return new Intl.DateTimeFormat('uk-UA', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(time));
}

const AdditionalMessageInfo = ({ message }) => {
    return (<>
        {message.edited && <p className={styles.mark_info}>edited</p>}
        < p className={styles.mark_info} > {getTimeInDay(message.createdAt)}</p >
    </>);
}

export default forwardRef((props, ref) => {
    const {
        message,
        onContextMenu,
        setImageViewer
    } = props;
    const [user, isLoading] = useMe();
    const [] = useState(false);

    const { selectedChat, focusOnMessage } = useChat();

    const openImageViewer = (index) => {
        setImageViewer({ images, currentImage: index, id: message._id });
    }

    const displayAttachment = (attachment, index) => {
        if (attachment.split(".").pop() === "webp") {
            return (<div key={attachment}
                onClick={() => openImageViewer(images.indexOf(chatAttachmentsStorage + attachment))}
                className={styles.attachment}>
                <img
                    src={chatAttachmentsStorage + attachment} loading="lazy" />
            </div>)
        }
        else{
            return( <div key={attachment}
                onClick={() => downloadFile(chatAttachmentsStorage + attachment)}
                className={styles.attachment}>
                <Icon style={{ ["--height"]: "60px" }} data={File} className={`hover__icon`} />
                <p className={styles.truncate__single}>{attachment}</p>
            </div>);
        }
    }

    const images = message.attachments
        .filter(attachment => attachment.split(".").pop() === "webp")
        .map(attachment => chatAttachmentsStorage + attachment);

    useImperativeHandle(ref, () => ({
        openImageViewer: () => openImageViewer(0),
        hasImages: () => images.length !== 0
    }))

    if (isLoading) {
        return null;
    }

    return (
        <div id={`message-${message._id}`} onContextMenu={(event) => onContextMenu(event, message)}
            className={`${styles.message} ${message.author._id === user ? styles.my__message : styles.other__message}`}
            key={message._id}>
            {selectedChat.type !== typesChat.PRIVATE && message.author._id !== user &&
                <p className={styles.author}>{message.author.name}</p>
            }
            {message.replied &&
                <div onClick={() => focusOnMessage(message.replied._id)} className={styles.replied__section}>
                    <p className={styles.original__author}>{message.replied.author.name}</p>
                    <p className={styles.original__text}>{message.replied.text}</p>
                </div>
            }
            {message.attachments.length !== 0 &&
                <div className={styles.attachments__container}>
                    {message.attachments.map(displayAttachment)}
                </div>
            }
            {message.text !== "" ? <div className={styles.content__message}>
                <p className={styles.text}>{message.text}</p>
                <AdditionalMessageInfo message={message} />
            </div> :
                <div className={styles.additional__info__on__attachment}>
                    <AdditionalMessageInfo message={message} />
                </div>
            }
        </div>
    )
});