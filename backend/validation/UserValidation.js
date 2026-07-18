import {body, query, param} from "express-validator"
import { createValidator } from "./Validator.js";

export const usernameValidator = (isOptional = false) => createValidator(
    body("username"),
    isOptional,
    (chain) => chain
        .exists().withMessage("USERNAME_IS_REQUIRED")
        .isLength({ min: 5, max: 15 }).withMessage("INVALID_USERNAME_LENGTH")
        .matches(/^\S+$/).withMessage("USERNAME_WITH_SPACES")
);

export const passwordValidator = (isOptional = false) => createValidator(
    body("password"),
    isOptional,
    (chain) => chain
        .exists().withMessage("PASSWORD_IS_REQUIRED")
        .isLength({ min: 6, max: 27 }).withMessage("INVALID_PASSWORD_LENGTH")
        .matches(/^\S+$/).withMessage("PASSWORD_WITH_SPACES")
);

export const nameValidator = (isOptional = false) => createValidator(
    body("name"),
    isOptional,
    (chain) => chain
        .exists().withMessage("NAME_IS_REQUIRED")
        .isLength({ min: 3, max: 20 }).withMessage("INVALID_NAME_LENGTH")
        .matches(/^\S(.*\S)?$/).withMessage("NAME_WITH_SPACES")
);

export const emailValidator = (isOptional = false) => createValidator(
    body("email"),
    isOptional,
    (chain) => chain
        .exists().withMessage("EMAIL_IS_REQUIRED")
        .isEmail().withMessage("INVALID_EMAIL_FORMAT")
        .normalizeEmail()
);