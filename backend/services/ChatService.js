import Chat from "../schemas/ChatSchema.js";
import chatTypes from "../models/ChatTypes.js";
import ApiError from "../models/ApiError.js";
import MemberRoles from "../models/MemberRoles.js";
import MemberRights from "../models/MemberRights.js";
import chatInfo from "../models/ChatInfo.js";
import ChatTypes from "../models/ChatTypes.js";
import UserService from "./UserService.js";
import mongoose from "mongoose";
import MessagesService from "./MessagesService.js";
import MinioService from "./MinioService.js";
import ChatSchema from "../schemas/ChatSchema.js";

//ARRAY CHAT INFO
const chatInfoArray = Object.keys(chatInfo);
const notRequiredChatInfo = ["avatar"];

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

        if (necessaryRole > strengthOfRole[member.role]) {
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

    async checkMemberInChat(userId, chatId) {
        const chat = await this.getChat(chatId);

        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const member = this.findMember(chat, userId);

        return member !== undefined;
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

    async getChat(chatId) {
        return await Chat.findById(chatId);
    }

    async findPrivateChat(userId1, userId2) {
        return await Chat.findOne({
            type: chatTypes.PRIVATE, members: {
                $all: [
                    { $elemMatch: { user: userId1 } },
                    { $elemMatch: { user: userId2 } }
                ]
            }
        });
    }

    async getUserChats(userId, searchText) {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        let query = [{
            $match: { "members.user": userObjectId }
        },
        {
            $lookup: {
                from: "users",
                localField: "members.user",
                foreignField: "_id",
                as: "users"
            },
        },

        {
            $addFields: {
                otherUser: {
                    $cond: {
                        if: { $eq: ["$type", ChatTypes.PRIVATE] },
                        then: {
                            $first: {
                                $filter: {
                                    input: "$users",
                                    as: "m",
                                    cond: { $ne: ["$$m._id", userObjectId] }
                                }
                            }
                        },
                        else: null
                    }
                }
            }
        },

        {
            $addFields: {
                title: {
                    $cond: {
                        if: { $eq: ["$type", ChatTypes.PRIVATE] },
                        then: "$otherUser.username",
                        else: "$title"
                    }
                },
                avatar: {
                    $cond: {
                        if: { $eq: ["$type", ChatTypes.PRIVATE] },
                        then: "$otherUser.avatar",
                        else: "$avatar"
                    }
                }
            }
        },

        {
            $project: {
                otherUser: 0
            }
        },];

        if (searchText) {
            query.push(
                {
                    $match: {
                        title: { $regex: searchText, $options: "i" }
                    }
                }
            );
        }

        query.push(
            {
                $project: {
                    users: 0
                }
            },
            { $sort: { lastActivity: -1 } },
        );

        let chats = await Chat.aggregate(query);

        chats = await Promise.all(chats.map(async chat => {
            const message = await MessagesService.getLastMessage(chat._id)
            if (message) {
                chat.lastMessage = message.text;
            }

            return chat;
        }));

        return chats;
    }

    async createPrivateChat(userId, chatConfiguration) {
        const otherUserId = chatConfiguration.members[0];

        const user = await UserService.getUser(userId);

        if (!user) {
            throw ApiError.badRequest();
        }

        if (userId === otherUserId) {
            throw ApiError.badRequest();
        }

        const otherUser = await UserService.getUser(otherUserId);

        if (!otherUser) {
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }
        const isChatExists = await Chat.exists({
            type: chatTypes.PRIVATE, members: {
                $all: [
                    { $elemMatch: { user: userId } },
                    { $elemMatch: { user: otherUserId } }
                ]
            }
        });
        if (isChatExists) {
            throw ApiError.badRequest("CHAT_ALREADY_EXISTS");
        }
        const membersInDatabase = [
            {
                user: userId,
                role: MemberRoles.OWNER,
                rights: []
            },
            {
                user: otherUserId,
                role: MemberRoles.OWNER,
                rights: []
            }
        ];

        chatConfiguration.members = membersInDatabase;

        const chat = (await Chat.create(chatConfiguration)).toObject();

        chat.title = otherUser.name;
        chat.createdBy = user.name;
        return chat;
    }

    async createGroup(userId, chatConfiguration) {
        for (const field of chatInfoArray) {
            if (!chatConfiguration[field] && !notRequiredChatInfo.includes(field)) {
                throw ApiError.badRequest(`${field.toUpperCase()}_IS_REQUIRED`);
            }
        }

        if (chatConfiguration.avatar) {
            try {
                const imageName = await MinioService.saveImage(chatConfiguration.avatar, "group-avatars");

                chatConfiguration.avatar = imageName;
            }
            catch (err) {
                delete chatConfiguration.avatar;
            }
        }

        const membersInDatabase = [{
            user: userId,
            role: MemberRoles.OWNER,
            rights: []
        }];

        for (const memberId of chatConfiguration.members) {
            if (!await UserService.getUser(memberId)) {
                throw ApiError.badRequest("USER_NOT_EXISTS");
            }

            if (membersInDatabase.find(member => member.user === memberId)) {
                throw ApiError.badRequest();
            }

            membersInDatabase.push({
                user: memberId,
                role: MemberRoles.MEMBER,
                rights: Object.keys(MemberRights.MEMBER)
            });
        }

        chatConfiguration.members = membersInDatabase;

        return await Chat.create(chatConfiguration);
    }

    async createChannel(userId, chatConfiguration) {
        for (const field of chatInfoArray) {
            if (!chatConfiguration[field] && !notRequiredChatInfo.includes(field)) {
                throw ApiError.badRequest(`${field.toUpperCase()}_IS_REQUIRED`);
            }
        }

        if (chatConfiguration.avatar) {
            try {
                const imageName = await MinioService.saveImage(chatConfiguration.avatar, "group-avatars");

                chatConfiguration.avatar = imageName;
            }
            catch {
                delete chatConfiguration.avatar;
            }
        }

        const membersInDatabase = [{
            user: userId,
            role: MemberRoles.OWNER,
            rights: []
        }];

        for (const memberId of chatConfiguration.members) {
            if (!await UserService.getUser(memberId)) {
                throw ApiError.badRequest("USER_NOT_EXISTS");
            }

            membersInDatabase.push({
                user: memberId,
                role: MemberRoles.MEMBER,
                rights: []
            });
        }

        chatConfiguration.members = membersInDatabase;

        return await Chat.create(chatConfiguration);
    }

    async create(userId, chatConfiguration) {
        switch (chatConfiguration.type) {
            case chatTypes.PRIVATE:
                return this.createPrivateChat(userId, chatConfiguration);
            case chatTypes.GROUP:
                return this.createGroup(userId, chatConfiguration);
            case chatTypes.CHANEL:
                return this.createChannel(userId, chatConfiguration);
            default:
                throw ApiError.badRequest();
        }
    }

    async delete(actorId, chatId) {
        const chat = await this.getChat(chatId);
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

        return await Chat.findByIdAndDelete(chatId);
    }

    async editInfoGroup(actorId, chatId, info) {
        const chat = getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        if (chat.type === ChatTypes.PRIVATE) {
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

    async addMembers(actorId, chatId, membersId) {
        const chat = await this.getChat(chatId);
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

            if (!await UserService.getUser(newMemberId)) {
                throw ApiError.badRequest("USER_NOT_EXISTS");
            }


            chat.members.push({
                user: newMemberId,
                role: MemberRoles.MEMBER,
                rights: Object.keys(MemberRights.MEMBER)
            });
        }

        await chat.save();

        return chat;
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

    async removeMember(actorId, chatId, memberId) {
        const chat = await this.getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const actor = this.findMember(chat, actorId);
        const member = this.findMember(chat, memberId);

        if (!actor) {
            throw ApiError.forbidden();
        }

        if (!member) {
            throw ApiError.forbidden();
        }

        if (strengthOfRole[actor.role] <= strengthOfRole[member.role]) {
            throw ApiError.forbidden();
        }

        chat.members = chat.members.filter(member => member.user != memberId);
        return await chat.save();
    }

    async leaveChat(actorId, chatId) {
        const chat = await this.getChat(chatId);
        if (!chat) {
            throw ApiError.badRequest("CHAT_NOT_EXISTS");
        }

        const actor = this.findMember(chat, actorId);

        if (!actor) {
            throw ApiError.badRequest();
        }

        if (actor.role === "OWNER") {
            throw ApiError.badRequest("OWNER_CANT_LEAVE_CHAT");
        }

        chat.members = chat.members.filter(member => member.user.toString() !== actorId);
        return await chat.save();
    }

    async getMembersDetail(chatId, pagination) {
        const skip = Number(pagination.skip) || 0;
        const limit = Number(pagination.limit) || 100;
        const chaIdObject = new mongoose.Types.ObjectId(chatId);

        const members = await Chat.aggregate([
            {
                $match: { _id: chaIdObject }
            },
            {
                $unwind: "$members"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "members.user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: "$user._id",
                    name: "$user.name",
                    avatar: "$user.avatar",
                    username: "$user.username",
                    role: "$members.role"
                }
            }]);

        return members;
    }
}

export default new ChatService();