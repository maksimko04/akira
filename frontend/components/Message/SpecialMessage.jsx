import styles from "./specialMessage.module.scss";

export default (props) => {
    const {text} = props;
    
    return (<div className={styles.special__message}>
            <p>{text}</p>
        </div>)
}