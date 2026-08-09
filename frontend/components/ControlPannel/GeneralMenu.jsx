import { forwardRef } from "react";
import UserApi from "../../api/UserApi";
import styles from "./generalMenu.module.scss";
import { useChat } from "../../providers/ChatContext";

const actions = [
    {
        text: "Logout",
        action: async (logout) => {
            try {
                logout();
            }
            catch { }
        }
    },
    {
        text: "New Group",
        action: async (logout) => {
            try {
                logout()
            }
            catch { }
        }
    },
    {
        text: "New Channel",
        action: async (logout) => {
            try {
                logout();
            }
            catch { }
        }
    }
];

export default forwardRef((props, ref) => {
    const { logout } = useChat();

    return (<div ref={ref} className={styles.animated__container}>
        <div className={styles.container}>
            {actions.map(action =>
                <button key={action.text} className={styles.option} onClick={() => action.action(logout)}>{action.text}</button>
            )}
        </div>
    </div>);
});