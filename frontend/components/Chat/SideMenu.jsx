"use client"

import { useState } from "react";
import ListChats from "./ListChats";
import styles from "./sideMenu.module.scss";
import GeneralMenu from "../ControlPannel/GeneralMenu";
import menuIcon from "@/assets/icons/menu.png"
import { useRef } from "react";

export default () => {
    const [searchText, setSearchText] = useState("");
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const menuRef = useRef(null);

    const switchMenu = () => {
        if (!menuIsOpen) {
            setMenuIsOpen(true);
            return;
        }

        const menu = menuRef.current;
        if (!menu) {
            return;
        }

        if(menu.classList.contains("closing__menu")){
            return;
        }

        menu.classList.add("closing__menu");

        menu.addEventListener('animationend', () => {
            setMenuIsOpen(false);
        }, { once: true });
        setTimeout(() => {
            setMenuIsOpen(false);
        }, 200);
    }

    return (<div className={styles.container}>
        <div className={styles.control__panel}>
            <button onClick={switchMenu}>
                <div
                    className="svg-icon"
                    style={{ '--src': `url("${menuIcon.src}")` }}
                ></div>
            </button>
            <div className={`${styles.fieldSearch} div-search`}>
                <input value={searchText} onChange={(event) => setSearchText(event.target.value)} type="search" placeholder="search..." />

            </div>
        </div>
        {
            menuIsOpen && <GeneralMenu ref={menuRef} />
        }
        {searchText ?
            <>
                <ListChats search={searchText} type="local" />
                <ListChats search={searchText} type="global" />
            </> :
            <ListChats />
        }
    </div>);
}