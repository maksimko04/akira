import Router from "express"
import userRouter from "./UserRouter.js";
import chatRouter from "./ChatRouter.js";

const router = new Router();

router.use("/user", userRouter);
router.use("/chat", chatRouter);

export default router;