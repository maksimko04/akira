import { forwardRef } from "react";
import UserApi from "../../api/UserApi";
import styles from "./generalMenu.module.scss";
import { useChat } from "../../providers/ChatContext";
import ChatApi from "../../api/ChatApi";
import typesChat from "../../constants/typesChat";
import { useToast } from "@/providers/toastProvider";
import typesToast from "@/constants/typesToast";
import { emailRegex, groupTitleRegex, nameRegex, usernameRegex } from "../../constants/regexes";
import serverResponses from "../../constants/serverResponses";
import { avatarsStorage } from "../../constants/fileBackets";

const modalCreateChat = (setActiveModal, createToast, setChats, openChat) => ({
    submitText: "Create",

    title: "Create Chat",
    width: "600px",
    nameUsers: "members",

    content: [
        {
            type: "combined",
            inside: [
                {
                    type: "file",
                    name: "avatar",
                    height: "150px",
                },
                {
                    type: "input",
                    name: "Group title",
                    key: "title",
                    maxLength: 25,
                },
            ]
        },
        {
            type: "select",
            name: "Type of Group",
            key: "type",
            options: [{
                value: typesChat.GROUP,
                text: "Group"
            },
            {
                value: typesChat.CHANNEL,
                text: "Channel"
            }]
        },
        {
            type: "finder-user",
            name: "Add User"
        }
    ],

    callback: async (data, formData) => {
        try {
            if (!groupTitleRegex.test(data.title)) {
                createToast(typesToast.warning, "Incorrect format title");
                return;
            }

            const response = await ChatApi.createChat(formData);

            setChats(prev => [response.data.chat, ...prev]);
            openChat(response.data.chat);

            setActiveModal(null);
        }
        catch (err) { }
    }
});

const modalMyAccount = async (setActiveModal, createToast) => {
    let user;
    try {
        const response = await UserApi.me();
        if (response) {
            user = response.data.user;
        }
    }
    catch {
        createToast(typesToast.error, "Something went wrong");
        return null;
    }

    return {
        submitText: "Edit Info",

        width: "550px",
        title: "My Account",

        content: [
            {
                type: "combined",
                inside: [
                    {
                        type: "file",
                        name: "avatar",
                        height: "150px",
                        defaultImage: (user.avatar ? avatarsStorage + user.avatar : null),
                        additionalInfo: user.name,
                    },
                    {
                        type: "vertical-combined",
                        inside: [
                            {
                                type: "input",
                                name: "Name",
                                key: "name",
                                placeholder: user.name,
                            },
                            {
                                type: "input",
                                name: "Username",
                                key: "username",
                                placeholder: user.username,
                            },
                        ]
                    }
                ]
            },
            {
                type: "input",
                name: "Email",
                key: "email",
                placeholder: user.email,
            },
            {
                type: "combined",
                inside: [
                    {
                        type: "input",
                        name: "Current Password",
                        key: "oldPassword",
                    },
                    {
                        type: "input",
                        name: "New Password",
                        key: "password",
                    },
                ]
            }
        ],

        callback: async (data, formData) => {
            try {
                for (const key in data) {
                    if (data[key] === user[key] || data[key] === "") {
                        delete data[key];
                        formData.delete(key);
                    }
                }

                if (data.email || data.password) {
                    if (!data.oldPassword) {
                        createToast(typesToast.warning, "If you want change email or password you need to enter current password", 4000)
                        return;
                    }
                }

                if (data.email) {
                    if (!emailRegex.test(data.email)) {
                        createToast(typesToast.warning, "Incorrect format of email", 4000)
                        return;
                    }
                }

                if (data.username) {
                    if (!usernameRegex.test(data.username)) {
                        createToast(typesToast.warning, "Incorrect format of username", 4000)
                        return;
                    }
                }

                if (data.name) {
                    if (!nameRegex.test(data.name)) {
                        createToast(typesToast.warning, "Incorrect format of name", 4000)
                        return;
                    }
                }

                await UserApi.editMe(formData);

                createToast(typesToast.success, "Changes saved")

                setActiveModal(null);
            }
            catch (err) {
                const message = serverResponses[err?.response?.data?.err] ?? "something went wrong";
                createToast(typesToast.error, message);
            }
        }
    }
};

const actions = [
    {
        text: "Logout",
        action: ({ logout }) => {
            try {
                logout();
            }
            catch { }
        }
    },
    {
        text: "New Chat",
        action: ({ setMenuIsOpen, setActiveModal, createToast, setChats, openChat }) => {
            setActiveModal(modalCreateChat(setActiveModal, createToast, setChats, openChat));
            setMenuIsOpen(null);
        }
    },
    {
        text: "My Account",
        action: async ({ setMenuIsOpen, setActiveModal, createToast }) => {
            setActiveModal(await modalMyAccount(setActiveModal, createToast));
            setMenuIsOpen(null);
        }
    }
];

export default forwardRef((props, ref) => {
    const { logout, setActiveModal, setChats, openChat } = useChat();
    const { setMenuIsOpen } = props;
    const createToast = useToast();

    return (<div ref={ref} className={styles.animated__container}>
        <div className={styles.container}>
            {actions.map(action =>
                <button key={action.text} className={styles.option}
                    onClick={() => action.action({
                        logout,
                        setActiveModal,
                        setMenuIsOpen,
                        createToast,
                        setChats,
                        openChat
                    })}>{action.text}</button>
            )}
        </div>
    </div>);
});