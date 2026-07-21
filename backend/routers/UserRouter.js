import Router from "express";
import userService from "../services/UserService.js";
import { nameValidator, passwordValidator, usernameValidator, emailValidator } from "../validation/UserValidator.js";
import { finalValidator as validator } from "../validation/Validator.js"
import checkRoleMiddleware from "../middleware/checkRoleMiddleware.js";
import Roles from "../models/Roles.js";
import { param } from "express-validator";
import responseService from "../services/ResponseService.js";
import { idPathValidator } from "../validation/GeneralValidator.js";

const router = new Router();

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/login",
    emailValidator(),
    passwordValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const { email, password } = req.body;
        const { user, jwtToken } = await userService.login(email, password);
        responseService.success(res, { user, jwtToken });
    }));

router.post("/registration",
    usernameValidator(),
    passwordValidator(),
    nameValidator(),
    emailValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const { user, jwtToken } = await userService.createUser(req.body);
        responseService.success(res, { user, jwtToken });
    }));

router.get("/me", checkRoleMiddleware(Roles.USER, Roles.ADMIN), catchAsync(async (req, res, next) => {
    const user = await userService.getUser(req.user.id);
    responseService.success(res, { user });
}));

router.get("/:id",
    idPathValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        const user = await userService.getUser(req.params.id);
        responseService.success(res, { user });
    }));

router.delete("/me",
    checkRoleMiddleware(Roles.USER, Roles.ADMIN),
    catchAsync(async (req, res, next) => {
        await userService.deleteUser(req.user.id);
        responseService.success(res, {});
    }))

router.delete("/:id",
    checkRoleMiddleware(Roles.ADMIN),
    idPathValidator(),
    validator,
    catchAsync(async (req, res, next) => {
        await userService.deleteUser(req.params.id);
        responseService.success(res, {});
    }));


router.put("/me",
    checkRoleMiddleware(Roles.ADMIN, Roles.USER),
    usernameValidator(true),
    passwordValidator(true),
    nameValidator(true),
    emailValidator(true),
    validator,
    catchAsync(async (req, res, next) => {
        const { oldPassword, ...updatedInfo } = req.body;
        const user = await userService.updateOwnUser(req.user.id, oldPassword, updatedInfo);
        responseService.success(res, { user });
    })
)

router.put("/:id",
    checkRoleMiddleware(Roles.ADMIN),
    idPathValidator(),
    usernameValidator(true),
    nameValidator(true),
    validator,
    catchAsync(async (req, res, next) => {
        const user = await userService.updateUserByAdmin(req.params.id, req.body);
        responseService.success(res, { user });
    }))

export default router;