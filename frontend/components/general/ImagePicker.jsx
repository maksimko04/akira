import { useState } from "react";

import styles from "./imagePicker.module.scss";

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
    const { name, defaultImage, additionalInfo } = props;

    const [preview, setPreview] = useState(defaultImage);

    const handleChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className={styles.avatar__container}>
            <label htmlFor={name} className={styles.avatar__wrapper}>
                {preview ?
                    <img src={preview} alt="Avatar" className={styles.avatar__img} /> :
                    <div style={
                        {
                            backgroundColor: stringToAvatarColor(additionalInfo),
                        }} className={styles.no__avatar}><p>{additionalInfo.toUpperCase()[0]}</p></div>
                }
                <div className={styles.avatar__overlay}>📷</div>
            </label>
            <input
                name={name}
                id={name}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className={styles.avatar__input}
            />
        </div>
    );
}