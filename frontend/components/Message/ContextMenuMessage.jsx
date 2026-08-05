
import messageActions from "../../constants/messageActions";
import useMe from "../../hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import styles from "./contextMenuMessage.module.scss";

const actions = [
    {
        text: "Edit",
        hideWhen: (user, message) => {
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

export default (props) => {
    const { info } = props;

    const { setTargetMessage, textMessageRef } = useChat();

    const [user, isLoading] = useMe();

    return (<ul style={{ ["--x"]: info.pos.x + "px", ["--y"]: info.pos.y + "px" }} className={styles.container}>
        {actions
            .filter(action => !action.hideWhen?.(user, info.message))
            .map(action =>
                <button key={action.text} className={styles.action} onClick={() => action.action({
                    message: info.message,
                    setTargetMessage,
                    textMessageRef
                })}>
                    <p>{action.text}</p>
                </button>
            )}
    </ul>);
}