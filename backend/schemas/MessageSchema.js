import mongoose from "mongoose"

const Message = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: function() {
            return !this.attachments || this.attachments.length === 0;
        }
    },
    replied: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    attachments: {
        type: [String],
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    edited: {
        type: Boolean,
        requied: true,
        default: false
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    },
    timestamps: true
});

export default mongoose.model("Message", Message);