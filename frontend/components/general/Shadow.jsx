
import styles from "./shadow.module.scss"

export default (props) => {
    const {callback} = props;

    return (<div onClick={callback} className={styles.shadow}></div>)
}