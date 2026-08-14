import { useRef } from "react";
import styles from "./modal.module.scss"
import ImagePicker from "./ImagePicker";

export default (props) => {
    const { info } = props;

    const formRef = useRef(null);

    const onSubmit = e => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const data = Object.fromEntries(formData.entries());

        info.callback(data, formData);
    }

    const getComponent = (componentInfo, index) => {
        switch (componentInfo.type) {
            case "combined": return (
                <div key={index} className={styles.combined__component}>
                    {componentInfo.inside.map((InsideComponentInfo, index) => getComponent(InsideComponentInfo, index))}
                </div>
            );
            case "file": return (
                <ImagePicker key={index} additionalInfo={componentInfo.additionalInfo} defaultImage={componentInfo.defaultImage} name={componentInfo.name}/>
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
        }
    }

    return (<form style={{ width: info.width }} onSubmit={onSubmit} ref={formRef} className={styles.container}>
        <p className={styles.form__title}>{info.title}</p>
        {info.content.map((componentInfo, index) =>
            getComponent(componentInfo, index)
        )}
        <button type="submit">{info.submitText}</button>
    </form>);
}