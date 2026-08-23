import { useEffect, useRef } from "react";
import styles from "./modal.module.scss"
import Avatar from "./Avatar";
import UserSearch from "../UserSearch/UserSearch";
import { createPortal } from "react-dom";
import { useChat } from "../../providers/ChatContext";

export default (props) => {
    const { info, portalNodeRef } = props;

    const formRef = useRef(null);
    const usersRef = useRef(null);

    const {addModalSetter, setActiveModal} = useChat();

    useEffect(() => {
        const unsubscribe = addModalSetter(setActiveModal);

        return unsubscribe;
    }, []);

    const onSubmit = e => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const data = Object.fromEntries(formData.entries());
        
        if(usersRef.current){
            formData.append(info.nameUsers, JSON.stringify(usersRef.current));
            data[info.nameUsers] = usersRef.current;
        }

        info.callback(data, formData);
    }

    const getComponent = (componentInfo, index) => {
        switch (componentInfo.type) {
            case "combined": return (
                <div key={index} className={styles.combined__component}>
                    {componentInfo.inside.map((InsideComponentInfo, index) => getComponent(InsideComponentInfo, index))}
                </div>
            );
            case "vertical-combined": return (
                <div key={index} className={styles.vertical__combined__component}>
                    {componentInfo.inside.map((InsideComponentInfo, index) => getComponent(InsideComponentInfo, index))}
                </div>
            );
            case "file": return (
                <Avatar key={index} additionalInfo={componentInfo.additionalInfo} height={componentInfo.height}
                    defaultImage={componentInfo.defaultImage} name={componentInfo.name} />
            );
            case "input": return (
                <div key={index} className={styles.input__container}>
                    <label htmlFor={componentInfo.name}>{componentInfo.name}</label>
                    <input name={componentInfo.key} id={componentInfo.name} type="text"
                        defaultValue={componentInfo.placeholder}
                        placeholder={componentInfo.placeholder} maxLength={componentInfo.maxLength}></input>
                </div>
            );
            case "select": return (
                <div key={index} className={styles.select__container}>
                    <label htmlFor={componentInfo.name}>{componentInfo.name}</label>
                    <select name={componentInfo.key} id={componentInfo.name}>
                        {componentInfo.options.map((option, index) =>
                            <option key={index} value={option.value}>{option.text}</option>
                        )}
                    </select>
                </div>
            );
            case "finder-user": return (<UserSearch userRef={usersRef} key={index} exclude={info.excludeUser}/>);
        }
    }

    return createPortal((<form onMouseDown={event => event.stopPropagation()} style={{ width: info.width }} onSubmit={onSubmit} ref={formRef} className={styles.container}>
        <p className={styles.form__title}>{info.title}</p>
        {info.content.map((componentInfo, index) =>
            getComponent(componentInfo, index)
        )}
        <button type="submit">{info.submitText}</button>
    </form>), portalNodeRef.current);
}