import {body, query, param} from "express-validator"
import { createValidator } from "./Validator.js";

export const textValidator = (isOptional = false) => createValidator(
    body("text"),
    isOptional,
    (chain) => chain
        .isString().trim()
        .notEmpty().withMessage("TEXT_EMPTY")
);

export const repliedValidator = (isOptional = false) => createValidator(
    body("replied"),
    isOptional,
    (chain) => chain.isMongoId().withMessage("INVALID_FORMAT")
);