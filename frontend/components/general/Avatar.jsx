import { useState } from "react";

import styles from "./avatar.module.scss";

const AVATAR_COLORS = [
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#F43F5E", // Rose
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#10B981", // Emerald
    "#14B8A6", // Teal
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
];

function stringToAvatarColor(value) {
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }

    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
export default (props) => {
    const { name, defaultImage, additionalInfo, onlyView, height, fontSize } = props;

    const [preview, setPreview] = useState(defaultImage);

    const handleChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    let avatarContent;

    if(preview){
        avatarContent = (<img src={preview} alt="Avatar" className={styles.avatar__image} />);
    }
    else if(additionalInfo){
        avatarContent = (<div
            style={{ backgroundColor: stringToAvatarColor(additionalInfo) }}
            className={`${styles.no__avatar} ${styles.avatar__image}`}
        >
            <p style={{fontSize}} >{additionalInfo.toUpperCase()[0]}</p>
        </div>);
    }

    return (
        <div className={`${styles.avatar__container} ${!onlyView && styles.interactive}`} style={{["--height"]: height}}>
            {onlyView ?
                avatarContent :
                <>
                    <label htmlFor={name} className={styles.avatar__wrapper}>
                        {avatarContent}
                        <div style={{fontSize}} 
                        className={!preview && !additionalInfo ? styles.avatar__active__overlay : styles.avatar__overlay}>📷</div>
                    </label>
                    <input
                        name={name}
                        id={name}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className={styles.avatar__input}
                    />
                </>
            }
        </div>
    );
}