import Router from "express";
import MessagesService from "../services/MessagesService.js";
import checkRoleMiddleware from "../middleware/checkRoleMiddleware.js";
import Roles from "../models/Roles.js";

const router = new Router();

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/create", checkRoleMiddleware(Roles.USER, Roles.ADMIN), catchAsync(async (req, res, next) => {
    const { text, attacments, replied } = req.body;
    const message = await MessagesService.createMessage(req.user.id, text, attacments, replied);
    res.json(message);
}));

router.get("/", catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    const messages = await MessagesService.getMessages(limit, skip);
    res.json(messages);
}));

export default router;