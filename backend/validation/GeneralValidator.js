import { body, query, param } from "express-validator"
import { createValidator } from "./Validator.js";

export const paginationValidator = (isOptional = true) => [
    createValidator(
        query("limit"),
        isOptional,
        (chain) => chain
            .isInt({ min: 1, max: 50 }).withMessage("LIMIT_MUST_BE_POSITIVE_NUMBER_LESS_50")
    ),
    createValidator(
        query("skip"),
        isOptional,
        (chain) => chain
            .isInt({ min: 0 }).withMessage("SKIP_MUST_BE_MIN_0")
    )
];

export const idPathValidator = () => param("id").isMongoId().withMessage("INVALID_ID");

export const idBodyValidator = (nameField, isOptional = false) => createValidator(
    body(nameField),
    isOptional,
    (chain) => chain
        .isMongoId().withMessage(`INVALID_${nameField.toUpperCase()}`)
);
export const idQueryValidator = (nameField, isOptional = false) => createValidator(
    query(nameField),
    isOptional,
    (chain) => chain
        .isMongoId().withMessage(`INVALID_${nameField.toUpperCase()}`)
);

export const arrayOfIdValidator = (arrName, isOptional = false) => createValidator(
    body(`${arrName}.*`),
    isOptional,
    (chain) => chain
        .isMongoId().withMessage(`INVALID_FORMAT_${arrName.toUpperCase()}`)
);