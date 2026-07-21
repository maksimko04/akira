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

export const patternMessageValidator = (isOptional = false) => createValidator(
    query("pattern"),
    isOptional,
    (chain) => chain.isString().withMessage("INVALID_PATTERN")
        .notEmpty().withMessage("INVALID_PATTERN")
);