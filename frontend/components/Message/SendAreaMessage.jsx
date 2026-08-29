import sendIcon from "@/assets/icons/send.png";
import Image from "next/image";

import ChatApi from "../../api/ChatApi";
import typesChat from "../../constants/typesChat";

import { Xmark, File, Plus } from "@gravity-ui/icons";
import { Icon } from "@gravity-ui/uikit";

import { useChat } from "../../providers/ChatContext";
import styles from "./sendAreaMessage.module.scss";
import { useEffect, useRef, useState } from "react";

export default (props) => {
    const { setIsControlPanelOpen } = props

    const { selectedChat, socket, targetMessage, textMessageRef, sendMessage, openChat, setChats } = useChat();

    const [files, setFiles] = useState([]);

    const messageToUncreatedChat = useRef(false);

    useEffect(() => {
        if (messageToUncreatedChat.current) {
            sendMessage(textMessageRef.current.value);
            textMessageRef.current.value = "";
            messageToUncreatedChat.current = false;
        }

        setIsControlPanelOpen(false)
    }, [selectedChat?._id]);

    const onSubmit = async event => {
        event.preventDefault();
        if (selectedChat.uncreated) {
            try {
                const response = await ChatApi.createChat({
                    type: typesChat.PRIVATE,
                    members: [selectedChat.userId]
                });

                socket.emit("created_private_chat", { userId: selectedChat.userId });

                openChat(response.data.chat);
                setChats(prev => [response.data.chat, ...prev]);

                messageToUncreatedChat.current = true;
            }
            catch (err) {
                console.log(err)
            }
            return;
        }

        sendMessage(textMessageRef.current.value, files);
        setFiles([]);
        textMessageRef.current.value = "";
    }

    const handlePaste = (event) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                if (!file) return;

                const imageUrl = URL.createObjectURL(file);

                setFiles(prev => [
                    ...prev,
                    {
                        type: "image",
                        file: file,
                        image: imageUrl,
                        title: file.name,
                        id: Date.now() + prev.length
                    }
                ]);
                return;
            }
        }
    };

    const cancelFile = (id) => {
        setFiles(prev => prev.filter(file => file.id !== id));
    }

    const loadFileFromButton = (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);

            setFiles(prev => [
                ...prev,
                {
                    type: file.type.startsWith("image/") ? "image" : "file",
                    file: file,
                    image: imageUrl,
                    title: file.name,
                    id: Date.now() + prev.length
                }
            ]);
        }
    }

    return (
        <form onSubmit={onSubmit} className={styles.sending__area}>
            <button type="button" className={`${styles.special__button}`}>
                <label htmlFor="file__add">
                    <Icon style={{ ["--height"]: "30px" }} data={Plus} className={`hover__icon ${styles.xmark}`} />
                </label>
                <input
                    id="file__add"
                    type="file"
                    accept="image/*"
                    onChange={loadFileFromButton}
                    style={{ display: "none" }}
                />
            </button>
            <div className={styles.writing__area}>
                {targetMessage &&
                    <div className={styles.action__description}>
                        <p className={styles.action__title}>{targetMessage.description}</p>
                        <p className={styles.action__message__text}>{targetMessage.text}</p>
                    </div>}
                {files.length !== 0 &&
                    <div className={styles.file__list}>
                        {files.map(file =>
                            <div key={file.id} className={styles.file__container}>
                                <button type="button" className="button__wrapper" onClick={() => cancelFile(file.id)} >
                                    <Icon style={{ ["--height"]: "30px" }} data={Xmark} className={`hover__icon ${styles.xmark}`} />
                                </button>
                                {file.type === "image" ?
                                    <img src={file.image} alt={file.title} className={styles.icon} /> :
                                    <Icon style={{ ["--height"]: "30px" }} data={File} className={styles.icon} />
                                }
                                <p className={styles.file__title}>{file.title}</p>
                            </div>
                        )}
                    </div>
                }
                <input ref={textMessageRef} onPaste={handlePaste} />
            </div>
            <button className={styles.special__button}>
                <Image src={sendIcon} alt="sent" />
            </button>
        </form>
    );
}