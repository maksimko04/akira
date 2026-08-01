"use client"

import Link from "next/link";

import "./header.css"
import { useTheme } from "next-themes";
import Image from "next/image";

import sunIcon from "@/app/assets/icons/sun.png";
import moonIcon from "@/app/assets/icons/moon.png";

export default () => {
    const { theme, setTheme } = useTheme();

    const changeTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <header className="header">
            <ul>
                <h1>Akira</h1>
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