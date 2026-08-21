
import { useEffect, useRef, useState } from "react";
import styles from "./userSearch.module.scss";
import UserApi from "../../api/UserApi";
import Avatar from "../general/Avatar";
import { Icon } from "@gravity-ui/uikit";
import { Xmark } from "@gravity-ui/icons";
import { avatarsStorage } from "../../constants/fileBackets";

export default (props) => {

    const { name, userRef, exclude=[] } = props;

    const [userSearchText, setUserSearchText] = useState("");
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [listMember, setListMember] = useState([]);

    const searchRef = useRef(null);

    useEffect(() => {
        const findSuggestedUsers = async () => {
            try {
                const response = await UserApi.globalSearch(userSearchText, 3, [...exclude, ...listMember.map(member => member._id)], true);
                setSuggestedUsers(response.data.users);
            }
            catch { }
        }

        findSuggestedUsers();
    }, [userSearchText]);

    useEffect(() => {
        userRef.current = [];
    }, []);

    const addMember = (user) => {
        if (listMember.find(userInList => userInList._id === user._id)) {
            return;
        }
        setListMember(prev => [user, ...prev]);
        userRef.current = [...userRef.current, user._id];
        setUserSearchText("");
        searchRef.current.focus();
    }

    const removeMember = (userId) => {
        setListMember(prev => prev.filter(user => user._id !== userId));
        userRef.current = userRef.current.filter(user => user !== userId);
    }

    return (
        <div className={styles.adding__user__container}>
            <label className={styles.adding__user__info}>
                <p>{name}</p>
                <p className={styles.count__members}>{
                    listMember.length === 0 ? "no members yet added" : `${listMember.length} members`}
                </p>
            </label>
            <input ref={searchRef}
                type="text"
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                maxLength={15}></input>

            {userSearchText !== "" && <div className={styles.list__suggested__users}>
                {suggestedUsers.length === 0 ? <p className={styles.no__users__found}>No users found</p> :
                    <>
                        {suggestedUsers.map(user =>
                            <button className={styles.suggested__user} key={user._id} onClick={() => addMember(user)}>
                                <Avatar onlyView={true} defaultImage={user.avatar && avatarsStorage + user.avatar}
                                    additionalInfo={user.name} fontSize="26px" />
                                <div className={styles.text__suggested__user__info}>
                                    <p>{user.name}</p>
                                    <p>@{user.username}</p>
                                </div>
                            </button>
                        )}
                    </>
                }
            </div>}

            {listMember.length !== 0 && <div className={styles.list__members}>
                {listMember.map(member =>
                    <div key={member._id} className={styles.selected__member}>
                        <Avatar onlyView={true} defaultImage={member.avatar && avatarsStorage + member.avatar}
                            additionalInfo={member.name} fontSize="12px" />
                        <p>{member.name}</p>
                        <button className="button__wrapper" onClick={() => removeMember(member._id)}>
                            <Icon style={{ ["--height"]: "80%" }} data={Xmark} className="hover__icon" />
                        </button>
                    </div>
                )}
            </div>}

        </div>
    );
}
