import Chat from "../schemas/ChatSchema.js";
import chatTypes from "../models/ChatTypes.js";
import ApiError from "../models/ApiError.js";
import MemberRoles from "../models/MemberRoles.js";
import MemberRights from "../models/MemberRights.js";
import chatInfo from "../models/ChatInfo.js";
import ChatTypes from "../models/ChatTypes.js";

//ARRAY CHAT INFO
const chatInfoArray = Object.keys(chatInfo)

//STRENGTH OF ROLES
const memberRolesArray = [MemberRoles.MEMBER, MemberRoles.ADMIN, MemberRoles.OWNER];
const strengthOfRole = {};
memberRolesArray.forEach((role, index) => {
    strengthOfRole[role] = index;
});

//STRENGTH OF RIGHTS
const strengthOfRight = {};
for (const role in MemberRights) {
    const level = strengthOfRole[role];
    for (const right in MemberRights[role]) {
        strengthOfRight[right] = level;
    }
}

class ChatService {
    checkRight(member, right) {
        if (!member) return false;

        let necessaryRole = strengthOfRight[right];

        if (necessaryRole < strengthOfRole[member.role]) {
            return true;
        }

        if(necessaryRole > strengthOfRole[member.role]){
            return false;
        }

        return member.rights.includes(right);
    }

    findMember(chat, userId) {
        let member;

        for (const memberI of chat.members) {
            if (memberI.user.toString() === userId.toString()) {
                member = memberI;
                break;
            }
        }

        return member;
    }

    async checkMemberInChat(userId, chatId){
        const chat = this.getChat(chatId);

        const member = this.findMember(chat, userId);

        return member === true;
    }

    changeMemberRight(member, right, active) {
        if (active) {
            if (!member.rights.includes(right)) {
                member.rights.push(right);
            }
        }
        else {
            member.rights = member.rights.filter(temp => temp !== right);
        }
    }

    async getChat(chatId){
        return await Chat.findById(chatId);
    }

    async getUserChats(userId, pagination){
        const limit = pagination.limit || 20;
        const skip = pagination.skip || 0;

        const chats = await Chat.find({"members.user": userId})
        .sort( {_id: -1 })
        .limit(limit)
        .skip(skip);

        return chats;
    }

    async create(chatConfiguration) {
        if (chatConfiguration.type === chatTypes.PRIVATE) {
            const user1 = chatConfiguration.members[0].user;
            const user2 = chatConfiguration.members[1].user;
            const chat = await Chat.findOne({
                type: chatTypes.PRIVATE, members: {
                    $all: [
                        { $elemMatch: { user: user1 } },
                        { $elemMatch: { user: user2 } }
                    ]
                }
            });
            if (chat) {
                throw ApiError.badRequest("CHAT_ALREADY_EXISTS");
            }
        }
        else{
            for(const field of chatInfoArray){
                if(!chatConfiguration[field]){
                    throw ApiError.badRequest();
                }
            }
        }
        return await Chat.create(chatConfiguration);
    }

    async delete(actorId, chatId) {
        const chat = getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const member = this.findMember(chat, actorId);

        if (!member) {
            throw ApiError.forbidden();
        }

        if (member.role !== MemberRoles.OWNER) {
            throw ApiError.badRequest("USER_NOT_OWNER");
            return;
        }

        await Chat.findByIdAndDelete(chatId);
    }

    async editInfoGroup(actorId, chatId, info) {
        const chat = getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        if(chat.type === ChatTypes.PRIVATE){
            throw ApiError.badRequest();
        }

        const member = this.findMember(chat, actorId);

        if (!member) {
            throw ApiError.forbidden();
        }

        if (!this.checkRight(member, MemberRights.MEMBER.CHANGE_GROUP_INFO)) {
            throw ApiError.forbidden();
        }

        for (const key in info) {
            if (!chatInfo[key]) {
                throw ApiError.badRequest("INVALID_REQUEST_DATA");
            }

            chat[key] = info[key];
        }

        await chat.save();

        return chat;
    }

    async addMembers(actorId, chatId, ...membersId) {
        const chat = getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const member = this.findMember(chat, actorId);

        if (!member) {
            throw ApiError.forbidden();
        }

        if (!this.checkRight(member, MemberRights.MEMBER.ADD_NEW_MEMBER)) {
            throw ApiError.forbidden();
        }

        for (const newMemberId of membersId) {
            if (this.findMember(chat, newMemberId)) {
                throw ApiError.badRequest("MEMBER_ALREADY_EXISTS");
            }
            chat.members.push({
                user: newMemberId,
                role: MemberRoles.MEMBER,
                right: Object.keys(MemberRights.MEMBER)
            });
        }

        await chat.save();

        return chat.members;
    }

    async editRights(actorId, chatId, memberId, role, rights) {
        const chat = getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const actor = this.findMember(chat, actorId);
        const member = this.findMember(chat, memberId);

        if (!actor) {
            throw ApiError.forbidden();
        }

        if (strengthOfRole[actor.role] <= strengthOfRole[member.role]) {
            throw ApiError.forbidden();
        }

        if (strengthOfRole[actor.role] < strengthOfRole[role]) {
            throw ApiError.forbidden();
        }

        if (member.role === MemberRoles.MEMBER && actor.role === MemberRoles.ADMIN && role === MemberRoles.ADMIN) {
            if (!actor.rights.includes(MemberRights.ADMIN.PROMOTE_TO_ADMIN)) {
                throw ApiError.forbidden();
            }
        }

        if (role === MemberRoles.OWNER) {
            actor.role = MemberRoles.ADMIN;
            actor.rights = Object.keys(MemberRights.ADMIN);
        }

        if (role !== member.role) {
            member.role = role;
            member.rights = Object.keys(MemberRights[role]);
        }
        else {
            for (const right in rights) {
                if (!Object.keys(MemberRights[role]).includes(right)) {
                    throw ApiError.badRequest("RIGHT_NOT_EXISTS");
                }

                this.changeMemberRight(member, right, rights[right]);
            }
        }

        await chat.save();

        return member;
    }

    async removeMember(actorId, chatId, memberId){
        const chat = getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const actor = this.findMember(chat, actorId);
        const member = this.findMember(chat, memberId);

        if (!actor) {
            throw ApiError.forbidden();
        }
        
        if(!member){
            throw ApiError.forbidden();
        }

        if (strengthOfRole[actor.role] <= strengthOfRole[member.role]) {
            throw ApiError.forbidden();
        }

        chat.members = chat.members.filter(member => member.id != memberId);
        await chat.save();
    }
}

export default new ChatService();