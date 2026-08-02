import Image from "next/image";

import styles from "./toast.module.scss"

import error from "@/assets/icons/error.png";
import warning from "@/assets/icons/warning.png";
import success from "@/assets/icons/success.png";
import typesToast from "@/constants/typesToast"

const icon = { error, warning, success }

export default (props) => {
    const { type, message } = props;

    return (<div className={styles.container}>
        <Image src={ icon[type] } alt={type === typesToast.error ? "err" : "success"}></Image>
        <p>{message}</p>
    </div>)
};