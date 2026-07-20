import Router from "express";
import MessagesService from "../services/MessagesService.js";
import checkRoleMiddleware from "../middleware/checkRoleMiddleware.js";
import Roles from "../models/Roles.js";
import responseService from "../services/ResponseService.js";
import { textValidator, repliedValidator } from "../validation/MessageValidation.js";
import { finalValidator as validator } from "../validation/Validator.js"
import CheckAuthorization from "../middleware/CheckAuthorization.js";

const router = new Router();

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// router.post("/create", 
//     checkRoleMiddleware(Roles.USER, Roles.ADMIN), 
//     textValidator(),
//     repliedValidator(true),
//     validator,
//     catchAsync(async (req, res, next) => {
//     const { text, attacments, replied } = req.body;
//     const message = await MessagesService.createMessage(req.user.id, text, attacments, replied);
//     responseService.success(res, { message });
// }));

// router.get("/", catchAsync(async (req, res, next) => {
//     const limit = parseInt(req.query.limit);
//     const skip = parseInt(req.query.skip);
//     const messages = await MessagesService.getMessages(limit, skip);
//     responseService.success(res, { messages });
// }));

router.post("/create", CheckAuthorization, 
    catchAsync(async (req, res, next) => {

}));

export default router;