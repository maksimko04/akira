import User from "../schemas/UserSchema.js";
import bcrypt from "bcryptjs";
import jwtService from "./JWTService.js";
import ApiError from "../models/ApiError.js";
import ChatTypes from "../models/ChatTypes.js";
import mongoose from "mongoose";
import MinioService from "./MinioService.js";
import { v4 as uuidv4 } from 'uuid';

const PROTECTED_IDENTITY_FIELDS = ["email", "password"];
const UNIQUE_IDENTITY_FIELDS = ["email", "username"];

class UserService {
    async getUser(id) {
        const user = await User.findById(id);
        if (!user) {
            throw ApiError.badRequest("USER_NOT_EXISTS")
        }
        return user;
    }

    async createUser(userInfo) {
        const { username, name, email, password } = userInfo;
        if (await User.findOne({ username })) {
            throw ApiError.badRequest("USER_WITH_USERNAME_ALREADY_EXISTS");
        }
        if (await User.findOne({ email })) {
            throw ApiError.badRequest("USER_WITH_EMAIL_ALREADY_EXISTS");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ username, name, email, password: hashedPassword });
        const jwtToken = jwtService.generateToken(user);
        return { user, jwtToken };
    }

    async login(email, password) {
        const user = await User.findOne({ email }).lean();
        if (!user) {
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }
        if (await bcrypt.compare(password, user.password)) {
            const jwtToken = jwtService.generateToken(user);
            return { user, jwtToken };
        }
        throw ApiError.badRequest("INVALID_CREDENTIALS");
    }

    async deleteUser(id) {
        await User.findByIdAndDelete(id);
    }

    async updateOwnUser(id, oldPassword, updatedInfo) {
        const user = await User.findById(id);
        if (!user) {
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }

        let hashedPassword = user.password;
        let requiredOldPassword = false;
        for (const key in updatedInfo) {
            if (user[key] === undefined) {
                throw ApiError.badRequest("INCORRECT_FIELD");
            }

            if (UNIQUE_IDENTITY_FIELDS.includes(key)) {
                if (user[key] === updatedInfo[key]) {
                    continue;
                }

                if (await User.findOne({ [key]: updatedInfo[key] })) {
                    throw ApiError.badRequest(`USER_WITH_${key.toUpperCase()}_ALREADY_EXISTS`);
                }
            }

            if (PROTECTED_IDENTITY_FIELDS.includes(key)) {
                requiredOldPassword = true;
            }
            if (key === "password") {
                const salt = await bcrypt.genSalt(10);
                user[key] = await bcrypt.hash(updatedInfo[key], salt);
            }
            else if (key === "avatar") {
                const imageName = `${uuidv4()}.webp`;
                await MinioService.saveImage(updatedInfo.avatar, imageName);

                if (user.avatar) {
                    await MinioService.deleteImage(user.avatar);
                }

                user.avatar = imageName;
            }
            else {
                user[key] = updatedInfo[key];
            }
        }

        if (requiredOldPassword) {
            oldPassword = oldPassword || "";
            if (!await bcrypt.compare(oldPassword, hashedPassword)) {
                throw ApiError.badRequest("INCORRECT_PASSWORD")
            }
        }

        await user.save();

        return user;
    }

    async updateUserByAdmin(id, updatedInfo) {
        const user = await User.findById(id);
        if (!user) {
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }

        for (const key in updatedInfo) {
            if (user[key] === undefined) {
                throw ApiError.badRequest("INCORRECT_FIELD");
            }

            if (PROTECTED_IDENTITY_FIELDS.includes(key)) {
                throw ApiError.badRequest("FORBIDDEN_OPERATION");
            }

            if (UNIQUE_IDENTITY_FIELDS.includes(key)) {
                if (user[key] === updatedInfo[key]) {
                    continue;
                }

                if (await User.findOne({ [key]: updatedInfo[key] })) {
                    throw ApiError.badRequest(`USER_WITH_${key.toUpperCase()}_ALREADY_EXISTS`);
                }
            }

            user[key] = updatedInfo[key];
        }

        await user.save();

        return user;
    }

    async findUsers(userId, usernameSearch) {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userObjectId },
                    username: { $regex: usernameSearch, $options: "i" },
                }
            },

            {
                $lookup: {
                    from: "chats",
                    let: { targetUserId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$type", ChatTypes.PRIVATE] },
                                        { $in: [userObjectId, "$members.user"] },
                                        { $in: ["$$targetUserId", "$members.user"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "existingChat"
                }
            },

            {
                $match: {
                    existingChat: { $size: 0 }
                }
            },

            {
                $limit: 10
            },

            {
                $project: {
                    password: 0,
                    existingChat: 0,
                    __v: 0
                }
            }
        ]);

        return users;
    }
}

export default new UserService();