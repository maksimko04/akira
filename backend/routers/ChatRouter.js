import Router from "express";
import MessagesService from "../services/MessagesService.js";
import checkRoleMiddleware from "../middleware/checkRoleMiddleware.js";
import Roles from "../models/Roles.js";
import responseService from "../services/ResponseService.js";
import { textValidator, repliedValidator } from "../validation/MessageValidator.js";
import { finalValidator as validator } from "../validation/Validator.js"
import CheckAuthorization from "../middleware/CheckAuthorization.js";
import ChatService from "../services/ChatService.js";
import { paginationValidator, idPathValidator, arrayOfIdValidator, idBodyValidator, searchText } from "../validation/GeneralValidator.js";
import { chatTypeValidator, memberRightsValidator, memberRoleValidator, membersValidator, titleValidator } from "../validation/ChatValidator.js";
import { uploadAvatarMiddleware } from "../middleware/Upload.js";
import ResponseService from "../services/ResponseService.js";

const router = new Router();

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/", CheckAuthorization,
    searchText(),
    validator,
    catchAsync(async (req, res, next) => {
        const { searchText } = req.query;
        const chats = await ChatService.getUserChats(req.user.id, searchText)

        responseService.success(res, { chats });
    })
);

router.get("/get-members/:id", CheckAuthorization,
    idPathValidator(),
    paginationValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const chatId = req.params.id;
        const { limit, skip } = req.query;

        const members = await ChatService.getMembersDetail(chatId, { limit, skip });

        responseService.success(res, { members });
    })
)

router.post("/create",
    uploadAvatarMiddleware,
    CheckAuthorization,
    titleValidator(true),
    membersValidator(),
    chatTypeValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const chatInfo = req.body;
        chatInfo.avatar = req.file?.buffer;
        const chat = await ChatService.create(req.user.id, req.body);

        const io = req.app.get("io");

        chat.members.forEach(member => {
            if (member.user.toString() === req.user.id) {
                return;
            }
            io.to(`user_${member.user}`).emit("created_chat", chat);
        });

        responseService.success(res, { chat });
    })
);

router.delete("/:id", CheckAuthorization,
    idPathValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const chat = await ChatService.delete(req.user.id, req.params.id);

        const io = req.app.get("io");

        chat.members.forEach(member => {
            if (member.user.toString() === req.user.id) {
                return;
            }
            io.to(`user_${member.user}`).emit("deleted_chat", chat._id);
        });

        responseService.success(res, {});
    })
)

router.put("/edit/:id", 
    uploadAvatarMiddleware,
    CheckAuthorization,
    idPathValidator(),
    titleValidator(true),
    validator,
    catchAsync(async (req, res, next) => {
        const {...info} = req.body;
        info.avatar = req.file?.buffer;
        const chat = await ChatService.editInfoGroup(req.user.id, req.params.id, info);

        responseService.success(res, { chat });
    })
)

router.put("/add-members/:id", CheckAuthorization,
    idPathValidator(),
    arrayOfIdValidator("members"),
    validator,
    catchAsync(async (req, res, next) => {
        const members = req.body.members;
        const chat = await ChatService.addMembers(req.user.id, req.params.id, members);

        const io = req.app.get("io");

        members.forEach(member => {
            io.to(`user_${member}`).emit("created_chat", chat);
        });

        chat.members.forEach(member => {
            if (members.includes(member.user.toString()) || req.user.id === member.user.toString()) {
                return;
            }

            io.to(`user_${member.user}`).emit("chat_changed", chat);
        });

        responseService.success(res, { chat });
    })
)

router.put("/edit-rights/:id", CheckAuthorization,
    idPathValidator(),
    idBodyValidator("memberId"),
    memberRoleValidator(),
    memberRightsValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const { memberId, role, rights } = req.body;
        const chatId = req.params.id;

        const member = await ChatService.editRights(req.user.id, chatId, memberId, role, rights);

        const io = req.app.get("io");

        io.to(`chat_${chatId}`).emit("member_info_changed", {chatId, member});

        responseService.success(res, { member });
    })
)

router.delete("/delete-member/:id", CheckAuthorization,
    idPathValidator(),
    idBodyValidator("memberId"),
    validator,
    catchAsync(async (req, res, next) => {
        const chatId = req.params.id;
        const memberId = req.body.memberId;
        const chat = await ChatService.removeMember(req.user.id, chatId, memberId);

        const io = req.app.get("io");

        chat.members.forEach(member => {
            if (req.user.id === member.user.toString()) {
                return;
            }

            io.to(`user_${member.user}`).emit("deleted_member", { memberId, chatId });
        });

        io.to(`user_${memberId}`).emit("deleted_member", { memberId, chatId });

        responseService.success(res, {});
    })
);

router.delete("/leave-chat/:chatId", CheckAuthorization,
    idPathValidator("chatId"),
    validator,
    catchAsync(async (req, res, next) => {
        const chatId = req.params.chatId;
        const chat = await ChatService.leaveChat(req.user.id, chatId);

        const io = req.app.get("io");

        io.to(`chat_${chatId}`).emit("chat_changed", chat);

        responseService.success(res, { chat });
    })
)

export default router;