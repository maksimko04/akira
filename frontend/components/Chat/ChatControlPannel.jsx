import { useChat } from "../../providers/ChatContext";
import { createPortal } from 'react-dom';

import styles from "./chatControlPannel.module.scss";
import Avatar from "../general/Avatar";
import { avatarsStorage, groupAvatarsStorage } from "../../constants/fileBackets";
import { useEffect, useState } from "react";
import ChatApi from "../../api/ChatApi";
import { useToast } from "@/providers/toastProvider"
import typesToast from "@/constants/typesToast";
import { checkRight, rights, strengthOfRole } from "../../shared/ChatRights";

const actions = [
    {
        title: "Change group info",
        callback: () => {

        }
    }
];

export default () => {
    const { selectedChat, setSelectedChat } = useChat();
    const [membersDetail, setMembersDetail] = useState([]);
    const createToast = useToast();

    useEffect(() => {
        const getMembersDetail = async () => {
            try {
                const response = await ChatApi.getMembersDetails(selectedChat._id);
                setMembersDetail(response.data.members);
            }
            catch {
                createToast(typesToast.error)
            }
        }

        getMembersDetail();
    }, [selectedChat._id]);

    useEffect(() => {
        setMembersDetail(prev => prev.filter(member => selectedChat.members.some(m => m.user === member._id)));
    }, [selectedChat.members]);

    const removeUser = async (memberId) => {
        try {
            await ChatApi.removeMember(selectedChat._id, memberId);

            setSelectedChat(prev => (
                { ...prev, members: prev.members.filter(member => member.user !== memberId) }));
        }
        catch (err) {
            createToast(typesToast.error);
        }
    }

    return (createPortal(<div className={styles.container}>
        <div className={styles.general__info}>
            <Avatar onlyView={true} defaultImage={selectedChat.avatar && groupAvatarsStorage + selectedChat.avatar}
                additionalInfo={selectedChat.title} fontSize="36px" height="65%" />
            <p className={styles.title}>{selectedChat.title}</p>
            <p className={styles.count__members}>{`${selectedChat.members.length} members`}</p>
        </div>
        <div className={styles.functions}>
            {actions.map(action =>
                <button key={action.title} className={styles.function__buton} onClick={() => action.callback()} >{action.title}</button>
            )}
        </div>
        <ul className={styles.members__list}>
            {membersDetail.map(member =>
                <div key={member._id} className={styles.member}>
                    <Avatar onlyView={true} defaultImage={member.avatar && avatarsStorage + member.avatar}
                        additionalInfo={member.name} fontSize="14px" height="90%" />
                    <div className={styles.text__info__member}>
                        <p>{member.name}</p>
                        <p>@{member.username}</p>
                    </div>
                    {
                        strengthOfRole[selectedChat.myMember.role] > strengthOfRole[member.role] &&
                        <button onClick={() => removeUser(member._id)} className={`${styles.remove__button} button__wrapper`}>Remove</button>
                    }
                </div>
            )}
        </ul>
    </div>, document.body));
}