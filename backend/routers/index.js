import Router from "express"
import userRouter from "./UserRouter.js";

const router = new Router();

router.use("/user", userRouter);

export default router;