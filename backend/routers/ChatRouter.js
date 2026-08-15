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
            if(member.user === req.user.id){
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
            if(member.user === req.user.id){
                return;
            }
            io.to(`user_${member.user}`).emit("deleted_chat", chat._id);
        });

        responseService.success(res, {});
    })
)

router.put("/edit/:id", CheckAuthorization,
    idPathValidator(),
    titleValidator(true),
    validator,
    catchAsync(async (req, res, next) => {
        const chat = await ChatService.editInfoGroup(req.user.id, req.params.id, req.body);

        responseService.success(res, { chat });
    })
)

router.put("/add-member/:id", CheckAuthorization,
    idPathValidator(),
    arrayOfIdValidator("members"),
    validator,
    catchAsync(async (req, res, next) => {
        const members = await ChatService.addMembers(req.user.id, req.params.id, req.body);

        responseService.success(res, { members });
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

        const member = await ChatService.editRights(req.user.id, req.params.id, memberId, role, rights);

        responseService.success(res, { member });
    })
)

router.put("/delete-member/:id", CheckAuthorization,
    idPathValidator(),
    idBodyValidator("memberId"),
    validator,
    catchAsync(async (req, res, next) => {
        await ChatService.removeMember(req.user.id, req.params.id, req.body.memberId);

        responseService.success(res, {});
    })
)

export default router;