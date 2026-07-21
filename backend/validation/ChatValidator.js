import { body, query, param } from "express-validator"
import { createValidator } from "./Validator.js";
import ChatTypes from "../models/ChatTypes.js";
import MemberRoles from "../models/MemberRoles.js";
import MemberRights from "../models/MemberRights.js";

export const chatTypeValidator = (isOptional = false) => createValidator(
    body("type"),
    isOptional,
    (chain) => chain
        .isIn(Object.keys(ChatTypes)).withMessage("INVALID_TYPE")
);

export const titleValidator = (isOptional = false) => createValidator(
    body("title"),
    isOptional,
    (chain) => chain
        .isString().withMessage().withMessage("TITLE_MUST_BE_STRING")
        .trim().isLength({ min: 1, max: 25 }).withMessage("INVALID_SIZE_OF_TITLE")
);

const rights = Object.values(MemberRights).flat();

// FULL MEMBERS IN DATABASE
// export const membersValidator = (isOptional = false) => [
//     createValidator(
//         body("members"),
//         isOptional,
//         (chain) => chain
//             .isArray({ min: 1 }).withMessage("NO_MEMBERS")
//     ),
//     createValidator(
//         body("members.*.user"),
//         isOptional,
//         (chain) => chain
//             .isMongoId().withMessage("INVALID_ID")
//     ),
//     createValidator(
//         body("members.*.role"),
//         isOptional,
//         (chain) => chain
//             .isIn(Object.keys(MemberRoles)).withMessage("INVALID_TYPE")
//     ),
//     createValidator(
//         body("members.*.rights.*"),
//         isOptional,
//         (chain) => chain
//             .isIn(rights).withMessage("INVALID_TYPE")
//     ),
// ];

export const membersValidator = (isOptional = false) => [
    createValidator(
        body("members"),
        isOptional,
        (chain) => chain
            .isArray().withMessage("NO_MEMBERS")
    ),
    createValidator(
        body("members.*"),
        isOptional,
        (chain) => chain
            .isMongoId().withMessage("INVALID_ID")
    ),
];

export const memberRoleValidator = (isOptional = false) => createValidator(
    body("role"),
    isOptional,
    (chain) => chain
        .isIn(Object.keys(MemberRoles.MEMBER)).withMessage("INVALID_TYPE")
);

export const memberRightsValidator = (isOptional = false) => createValidator(
    body("rights"),
    isOptional,
    (chain) => chain
        .isIn(rights).withMessage("INVALID_TYPE")
);

