import { useChat } from "../../providers/ChatContext";
import { createPortal } from 'react-dom';

import styles from "./chatControlPannel.module.scss";
import Avatar from "../general/Avatar";
import { avatarsStorage, groupAvatarsStorage } from "../../constants/fileBackets";
import { useEffect, useRef, useState } from "react";
import ChatApi from "../../api/ChatApi";
import { useToast } from "@/providers/toastProvider"
import typesToast from "@/constants/typesToast";
import { strengthOfRole } from "../../shared/ChatRights";
import UserApi from "../../api/UserApi";
import { Xmark } from "@gravity-ui/icons";
import { Icon } from "@gravity-ui/uikit";
import typesChat from "../../constants/typesChat";

const createAddMembersModal = ({ setSelectedChat, selectedChat, setActiveModal, createToast }) => ({
    submitText: "Add",

    title: "Add members",
    width: "600px",
    nameUsers: "members",
    excludeUser: selectedChat.members.map(member => member.user),

    content: [
        {
            type: "finder-user",
            name: "Add User"
        }
    ],

    callback: async (data) => {
        try {
            const response = await ChatApi.addMembers(selectedChat._id, data.members);
            setActiveModal(null);

            setSelectedChat(prev => ({ ...prev, members: response.data.chat.members }));

            createToast(typesToast.success, `Added ${data.members.length} members`);
        }
        catch (err) {
            createToast();
        }
    }
});

const createEditChatModal = ({ setSelectedChat, selectedChat, setActiveModal, createToast, setChats }) => ({
    submitText: "Edit",

    title: "Edit chat",
    width: "600px",

    content: [
        {
            type: "combined",
            inside: [
                {
                    type: "file",
                    name: "avatar",
                    height: "150px",
                    defaultImage: (selectedChat.avatar ? groupAvatarsStorage + selectedChat.avatar : null),
                    additionalInfo: selectedChat.title,
                },
                {
                    type: "input",
                    name: "Group title",
                    key: "title",
                    placeholder: selectedChat.title,
                    maxLength: 25,
                },
            ]
        },
    ],

    callback: async (data, formData) => {
        try {
            const response = await ChatApi.editChat(selectedChat._id, formData);

            console.log(response);

            setSelectedChat(prev => ({ ...prev, ...response.data.chat }));

            createToast(typesToast.success, "chat is successfully edited");

            setActiveModal(null);
        }
        catch (err) {
            console.log(err)
            createToast();
        }
    }
});

const actions = [
    {
        title: "Change group info",
        hideWhen: (info) => {
            return info.selectedChat.type === typesChat.PRIVATE;
        },
        callback: (info) => {
            info.setActiveModal(createEditChatModal(info));
        }
    },
    {
        title: "Add members",
        hideWhen: (info) => {
            return info.selectedChat.type === typesChat.PRIVATE;
        },
        callback: (info) => {
            info.setActiveModal(createAddMembersModal(info));
        }
    }
];

export default (props) => {
    const { setIsControlPanelOpen } = props;
    const { selectedChat, setSelectedChat, setActiveModal, setChats } = useChat();
    const [membersDetail, setMembersDetail] = useState([]);
    const createToast = useToast();
    const membersDetailsInitialized = useRef(false);

    useEffect(() => {
        const getMembersDetail = async () => {
            try {
                const response = await ChatApi.getMembersDetails(selectedChat._id);
                setMembersDetail(response.data.members);
            }
            catch {
                createToast()
            }
            finally {
                membersDetailsInitialized.current = true;
            }
        }

        getMembersDetail();
    }, [selectedChat._id]);

    useEffect(() => {
        let isMounted = true;
        const changeMembersDetail = async () => {
            setMembersDetail(prev => prev.filter(member => selectedChat.members.some(m => m.user === member._id)));

            const newMembers = await Promise.all(
                selectedChat.members
                    .filter(member => !membersDetail.some(memberDetail => memberDetail._id === member.user))
                    .map(async member => {
                        try {
                            const response = await UserApi.getUser(member.user);

                            return { ...response.data.user, role: member.role };
                        }
                        catch {
                            return null;
                        }
                    })
            );

            if (isMounted) {
                setMembersDetail(prev => [...prev, ...(newMembers.filter(Boolean))]);
            }
        }

        if (membersDetailsInitialized.current) {
            changeMembersDetail();
        }

        return () => {
            isMounted = false;
        }
    }, [selectedChat.members]);

    const removeUser = async (memberId) => {
        try {
            await ChatApi.removeMember(selectedChat._id, memberId);

            setSelectedChat(prev => (
                { ...prev, members: prev.members.filter(member => member.user !== memberId) }));
        }
        catch (err) {
            createToast();
        }
    }

    const getStorage = (type) => type === typesChat.PRIVATE ? avatarsStorage : groupAvatarsStorage;

    const dataForActions = {
        selectedChat,
        setActiveModal,
        createToast,
        setSelectedChat,
        setChats
    };

    return (createPortal(<div onMouseDown={(event) => { event.stopPropagation() }} className={styles.container}>
        <div className={styles.general__info}>
            <Avatar outClassName={styles.chat__avatar} zonlyView={true} defaultImage={selectedChat.avatar && getStorage(selectedChat.type) + selectedChat.avatar}
                additionalInfo={selectedChat.title} fontSize="36px" height="65%" />
            <div className={styles.text__general__info}>
                <p className={styles.title}>{selectedChat.title}</p>
                {selectedChat.type !== typesChat.PRIVATE && <p className={styles.count__members}>{`${selectedChat.members.length} members`}</p>}
            </div>
            <div className="button__wrapper" onClick={() => setIsControlPanelOpen(false)}>
                <Icon style={{ ["--height"]: "30px" }} data={Xmark} className={`hover__icon ${styles.xmark}`} />
            </div>
        </div>
        <div className={styles.functions}>
            {actions.map(action =>
                !action?.hideWhen?.(dataForActions) && <button key={action.title} className={styles.function__buton}
                    onClick={() => action.callback(dataForActions)} >{action.title}</button>
            )}
        </div>
        <ul className={styles.members__list}>
            {selectedChat.type !== typesChat.PRIVATE && membersDetail.map(member =>
                <div key={member._id} className={styles.member}>
                    <Avatar onlyView={true} defaultImage={member.avatar && avatarsStorage + member.avatar}
                        additionalInfo={member.name} fontSize="14px" height="90%" />
                    <div className={styles.text__info__member}>
                        <p>{member.name}</p>
                        <p>@{member.username}</p>
                    </div>
                    {
                        strengthOfRole[selectedChat.myMember.role] > strengthOfRole[member.role] &&
                        <button onClick={(event) => { event.stopPropagation(), removeUser(member._id) }} className={`${styles.remove__button} button__wrapper`}>Remove</button>
                    }
                </div>
            )}
        </ul>
        {selectedChat.type === typesChat.PRIVATE && <p style={{ padding: "5px" }}>
            Очікуйте на нові оновлення...
            <br />
            А якщо хочете побачити тут щось більш осмислене то дивіться в групах, а не в лс
            <br />
            <br />

            <i>Ваш улюблений @maksimko04</i>
        </p>}
    </div>, document.body));
}