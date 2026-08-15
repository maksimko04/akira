import checkRoleMiddleware from "../middleware/CheckRoleMiddleware.js";
import MessagesService from "../services/MessagesService.js";
import { Router } from "express";
import { messagePaginationValidator, patternMessageValidator, repliedValidator, textValidator } from "../validation/MessageValidator.js";
import Roles from "../models/Roles.js";
import { finalValidator as validator } from "../validation/Validator.js"
import { idBodyValidator, idPathValidator, idQueryValidator } from "../validation/GeneralValidator.js";
import CheckAuthorization from "../middleware/CheckAuthorization.js";
import ResponseService from "../services/ResponseService.js";

const router = new Router();

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/:id",
    CheckAuthorization,
    idPathValidator(),
    idQueryValidator("memberId", true),
    patternMessageValidator(true),
    messagePaginationValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const messages = await MessagesService.getMessages(
            req.user.id,
            {
                chatId: req.params.id,
                pattern: req.query.pattern,
                memberId: req.query.memberId
            },
            {
                ...req.query
            });

        ResponseService.success(res, { messages });
    }));

router.put("/:id",
    CheckAuthorization,
    idPathValidator(),
    textValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const editMessage = await MessagesService.editMessage(req.user.id, req.params.id, req.body.text);
        ResponseService.success(res, { message: editMessage });
    })
);

router.delete("/:id", CheckAuthorization,
    idPathValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        await MessagesService.deleteMessage(req.user.id, req.params.id);
        ResponseService.success(res, {});
    }));

export default router;