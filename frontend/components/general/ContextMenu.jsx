import useMe from "../../hooks/useMe";
import { useChat } from "../../providers/ChatContext";
import styles from "./contextMenu.module.scss";

export default (props) => {
    const { className, actions, info } = props;

    const [user, isLoading] = useMe();

    return (<ul style={info.pos ? { ["--x"]: info.pos.x + "px", ["--y"]: info.pos.y + "px" } : {}}
        className={`${styles.container} ${className}`}>
        {actions
            .filter(action => !action.hideWhen?.(user, info.data))
            .map(action =>
                <button key={action.text} className={styles.action} onClick={() => action.action(info.data)}>
                    <p>{action.text}</p>
                </button>
            )}
    </ul>);
}