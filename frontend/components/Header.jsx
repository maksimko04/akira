"use client"

import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import sunIcon from "@/assets/icons/sun.png";
import moonIcon from "@/assets/icons/moon.png";

import styles from "./header.module.scss"

export default () => {
    const { theme, setTheme } = useTheme();

    const changeTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <header className={styles.header}>
            <ul>
                <Link className={styles.link__home} href={"/"}>Akira</Link>
                <ul>
                    <Link href={"/registration"}>sign up</Link>
                    <Link href={"/login"}>sign in</Link>
                    <button onClick={changeTheme}>
                        <Image src={theme === "light" ? moonIcon : sunIcon} alt="" />
                    </button>
                </ul>
            </ul>
        </header>
    );
}