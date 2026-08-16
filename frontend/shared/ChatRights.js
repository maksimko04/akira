const memberRolesArray = ["MEMBER", "ADMIN", "OWNER"];
export const strengthOfRole = {};
memberRolesArray.forEach((role, index) => {
    strengthOfRole[role] = index;
});

export const rights = Object.freeze({
    MEMBER: {
        EDIT_OWN_MESSAGES: "EDIT_OWN_MESSAGES",
        DELETE_OWN_MESSAGES: "DELETE_OWN_MESSAGES",
        SEND_MESSAGES: "SEND_MESSAGES",
        SEND_PHOTOS: "SEND_PHOTOS",
        SEND_FILES: "SEND_FILES",
        CHANGE_GROUP_INFO: "CHANGE_GROUP_INFO",
        ADD_NEW_MEMBER: "ADD_NEW_MEMBER" 
    },
    ADMIN: {
        DELETE_MESSAGES: "DELETE_MESSAGES",
        PROMOTE_TO_ADMIN: "PROMOTE_TO_ADMIN",
    },
    OWNER: {}
});

const strengthOfRight = {};
for (const role in rights) {
    const level = strengthOfRole[role];
    for (const right in rights[role]) {
        strengthOfRight[right] = level;
    }
}

export function checkRight(member, right) {
    if (!member) return false;

    let necessaryRole = strengthOfRight[right];

    if (necessaryRole < strengthOfRole[member.role]) {
        return true;
    }

    if (necessaryRole > strengthOfRole[member.role]) {
        return false;
    }

    return member.rights.includes(right);
}