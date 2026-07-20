import mongoose from "mongoose"

const Message = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    replied: mongoose.Schema.Types.ObjectId,
    attachments: {
        type: [String],
        default: []
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