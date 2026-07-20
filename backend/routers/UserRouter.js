import Router from "express";
import userService from "../services/UserService.js";
import { nameValidator, passwordValidator, usernameValidator, emailValidator } from "../validation/UserValidation.js";
import { finalValidator as validator } from "../validation/Validator.js"
import checkRoleMiddleware from "../middleware/checkRoleMiddleware.js";
import Roles from "../models/Roles.js";
import { param } from "express-validator";

const router = new Router();

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/login",
    emailValidator(),
    passwordValidator(),
    validator,
    catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const { user, jwtToken } = await userService.login(email, password);
        res.json({ user, jwtToken });
    }));

router.post("/registration",
    usernameValidator(),
    passwordValidator(),
    nameValidator(),
    emailValidator(),
    validator,
    catchAsync(async (req, res) => {
        const { user, jwtToken } = await userService.createUser(req.body);
        res.json({ user, jwtToken });
    }));

router.get("/me", checkRoleMiddleware(Roles.USER, Roles.ADMIN), catchAsync(async (req, res) => {
    const user = await userService.getUser(req.user.id);
    res.json({ user });
}));

router.get("/:id",
    param("id").isMongoId().withMessage("INVALID_ID"),
    validator,
    catchAsync(async (req, res) => {
        const user = await userService.getUser(req.params.id);
        res.json({ user });
    }));

router.delete("/me",
    checkRoleMiddleware(Roles.USER, Roles.ADMIN),
    catchAsync(async (req, res) => {
        await userService.deleteUser(req.user.id);
        res.json({ ok: true });
    }))

router.delete("/:id",
    checkRoleMiddleware(Roles.ADMIN),
    param("id").isMongoId().withMessage("INVALID_ID"),
    validator,
    catchAsync(async (req, res) => {
        await userService.deleteUser(req.params.id);
        res.json({ ok: true });
    }));


router.put("/me",
    checkRoleMiddleware(Roles.ADMIN, Roles.USER),
    usernameValidator(true),
    passwordValidator(true),
    nameValidator(true),
    emailValidator(true),
    validator,
    catchAsync(async (req, res) => {
        const { oldPassword, ...updatedInfo } = req.body;
        const user = await userService.updateOwnUser(req.user.id, oldPassword, updatedInfo);
        res.json({ user });
    })
)

router.put("/:id",
    checkRoleMiddleware(Roles.ADMIN),
    param("id").isMongoId().withMessage("INVALID_ID"),
    usernameValidator(true),
    nameValidator(true),
    validator,
    catchAsync(async (req, res) => {
        const user = await userService.updateUserByAdmin(req.params.id, req.body);
        res.json({ user });
    }))

export default router;