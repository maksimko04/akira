import { createPortal } from "react-dom";
import styles from "./imageViewer.module.scss"
import { useChat } from "../../providers/ChatContext";
import { useEffect } from "react";
import { Icon } from "@gravity-ui/uikit";
import { ArrowLeft, ArrowRight } from "@gravity-ui/icons";

export default (props) => {
    const {
        portalNodeRef,
        info: { images, currentImage },
        setImageViewer,
        hasImages,
        switchImages
    } = props;

    const { addModalSetter } = useChat();

    useEffect(() => {
        const unsubscribe = addModalSetter(setImageViewer);

        return unsubscribe;
    }, []);

    return createPortal((
        <div className={styles.container}>
            <img className={styles.image} src={images[currentImage]} />

            <div className={styles.images__list}>
                {images.map((image, index) =>
                    <div key={image} onClick={() => setImageViewer(prev => ({ images, currentImage: index }))}>
                        <img className={styles.image__item} src={image} />
                    </div>
                )}
            </div>
            {hasImages(true) &&
                <div className={`button__wrapper ${styles.left__arrow}`} onClick={() => switchImages(true)}>
                    <Icon style={{ ["--height"]: "50px" }} data={ArrowLeft} className={`hover__icon`} />
                </div>}
            {hasImages(false) &&
                <div className={`button__wrapper ${styles.right__arrow}`} onClick={() => switchImages(false)}>
                    <Icon style={{ ["--height"]: "50px" }} data={ArrowRight} className={`hover__icon`} />
                </div>}
        </div>
    ), portalNodeRef.current);
}