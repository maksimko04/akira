import Router from "express"
import userRouter from "./UserRouter.js";
import chatRouter from "./ChatRouter.js";
import messageRouter from "./MessageRouter.js";

const router = new Router();

router.use("/user", userRouter);
router.use("/chat", chatRouter);
router.use("/message", messageRouter);

export default router;