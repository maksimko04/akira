import { body, query, param } from "express-validator"
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

export const messagePaginationValidator = (isOptional = true) => [
    createValidator(
        query("limit"),
        isOptional,
        (chain) => chain
            .isInt({ min: 1, max: 100 }).withMessage("LIMIT_MUST_BE_POSITIVE_NUMBER_LESS_50")
    ),
    createValidator(
        query("direction"),
        isOptional,
        (chain) => chain
            .isIn(["above", "below", "both"]).withMessage("INVALID_DIRECTION")
    ),
    createValidator(
        query("offset"),
        isOptional,
        (chain) => chain
            .isMongoId().withMessage("WRONG_OFFSET")
    )
];