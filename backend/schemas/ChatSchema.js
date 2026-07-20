import mongoose from "mongoose";
import ChatTypes from "../models/ChatTypes.js";
import MemberRights from "../models/MemberRights.js";
import ChatInfo from "../models/ChatInfo.js";

const rights = Object.values(MemberRights).map(obj => Object.values(obj)).flat();

const ChatSchema = new mongoose.Schema({...{
    type: {
        type: String,
        enum: Object.values(ChatTypes),
        required: true
    },
    members: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "User"
            },
            role: {
                type: String,
                enum: Object.keys(MemberRights),
                required: true
            },
            rights: {
                type: [String],
                enum: rights
            }
        }]
    },
    //GROUP && CHANELS
}, ...ChatInfo}, {
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.Model("Chat", ChatSchema);