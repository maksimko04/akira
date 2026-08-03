import useMe from "../../hooks/useMe";
import styles from "./message.module.scss"

export default (props) => {
    const {message} = props;
    const [user, isLoading] = useMe();

    if(isLoading){
        return null;
    }

    const getTimeInDay = (time) => {
        return new Intl.DateTimeFormat('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(time));
    }

    return (
        <div className={`${styles.message} ${message.author === user ? styles.my__message : styles.other__message}`} key={message._id}>
            <p className={styles.text}>{message.text}</p>
            <p className={styles.time__created}>{getTimeInDay(message.createdAt)}</p>
        </div>
    )
};