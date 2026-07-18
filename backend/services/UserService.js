import User from "../schemas/UserSchema.js";
import bcrypt from "bcryptjs";
import jwtService from "./JWTService.js";
import ApiError from "../models/ApiError.js";

const PROTECTED_IDENTITY_FIELDS = ["email", "password"];
const UNIQUE_IDENTITY_FIELDS = ["email", "username"];

class UserService {
    async getUser(id) {
        const user = await User.findById(id);
        if(!user){
            throw ApiError.badRequest("USER_NOT_EXISTS")
        }
        return user;
    }

    async createUser(userInfo) {
        const {username, name, email, password} = userInfo;
        if(await User.findOne({username})){
            throw ApiError.badRequest("USER_ALREADY_EXISTS");
        }
        if(await User.findOne({email})){
            throw ApiError.badRequest("EMAIL_ALREADY_EXISTS");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({username, name, email, password: hashedPassword});
        const jwtToken = jwtService.generateToken(user);
        return {user, jwtToken};
    }

    async login(email, password) {
        const user = await User.findOne({email});
        if(!user){
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }
        if(await bcrypt.compare(password, user.password)) {
            const jwtToken = jwtService.generateToken(user);
            return {user, jwtToken};
        }
        throw ApiError.badRequest("INVALID_PASSWORD");
    }

    async deleteUser(id){
        await User.findByIdAndDelete(id);
    }

    async updateOwnUser(id, oldPassword, updatedInfo) {
        const user = await User.findById(id);
        if(!user){
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }

        let hashedPassword = user.password;
        let requiredOldPassword = false;
        for(const key in updatedInfo){
            if(user[key] === undefined){
                throw ApiError.badRequest("INCORRECT_FIELD");
            }
            
            if(UNIQUE_IDENTITY_FIELDS.includes(key)){
                if(user[key] === updatedInfo[key]){
                    continue;
                }

                if(await User.findOne({[key]: updatedInfo[key]})) {
                    throw ApiError.badRequest(`USER_EXISTS_WITH_SAME_${key.toUpperCase()}`);
                }
            }

            if(PROTECTED_IDENTITY_FIELDS.includes(key)){
                requiredOldPassword = true;
            }
            if(key === "password"){
                const salt = await bcrypt.genSalt(10);
                user[key] = await bcrypt.hash(updatedInfo[key], salt);
            }
            else{
                user[key] = updatedInfo[key];
            }
        }

        if(requiredOldPassword){
            oldPassword = oldPassword || "";
            if(!await bcrypt.compare(oldPassword, hashedPassword)){
                throw ApiError.badRequest("INCORRECT_PASSWORD")
            }
        }

        await user.save();

        return user;
    }

    async updateUserByAdmin(id, updatedInfo){
        const user = await User.findById(id);
        if(!user){
            throw ApiError.badRequest("USER_NOT_EXISTS");
        }

        for(const key in updatedInfo) {
            if(user[key] === undefined){
                throw ApiError.badRequest("INCORRECT_FIELD");
            }

            if(PROTECTED_IDENTITY_FIELDS.includes(key)){
                throw ApiError.badRequest("FORBIDDEN_OPERATION");
            }

            if(UNIQUE_IDENTITY_FIELDS.includes(key)){
                if(user[key] === updatedInfo[key]){
                    continue;
                }

                if(await User.findOne({[key]: updatedInfo[key]})){
                    throw ApiError.badRequest(`USER_EXISTS_WITH_SAME_${key.toUpperCase()}`);
                }
            }

            user[key] = updatedInfo[key];
        }

        await user.save();

        return user;
    }
}

export default new UserService();