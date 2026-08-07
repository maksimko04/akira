import { forwardRef } from "react";
import UserApi from "../../api/UserApi";
import styles from "./generalMenu.module.scss";
import { useRouter } from "next/navigation";

const actions = [
    {
        text: "Logout",
        action: async (router) => {
            try{
                const response = await UserApi.logout();
                router.replace("/login");
            }
            catch{}
        }
    },
    {
        text: "New Group",
        action: async (router) => {
            try{
                console.log("SDF")
                const response = await UserApi.logout();
                console.log("SD")
                router.replace("/login");
            }
            catch{}
        }
    },
    {
        text: "New Channel",
        action: async (router) => {
            try{
                const response = await UserApi.logout();
                router.replace("/login");
            }
            catch{}
        }
    }
];

export default forwardRef((props, ref) => {
    const router = useRouter();

    return (<div ref={ref} className={styles.animated__container}>
        <div className={styles.container}>
            {actions.map(action => 
                <button key={action.text} className={styles.option} onClick = {() => action.action(router)}>{action.text}</button>
            )}
        </div>
    </div>);
});