import mongoose from "mongoose";
import Roles from "../models/Roles.js";

const User = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    name: { 
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: Object.values(Roles),
        default: Roles.USER,
        required: true
    }}, {
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        }
    }
);

export default mongoose.model("User", User);