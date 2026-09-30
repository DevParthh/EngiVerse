// Filename: server/models/messageModel.js (UPGRADED FOR SELECTIVE DELETION)

import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'document'],
        default: 'text'
    },
    content: {
        type: String,
        required: true
    },
    fileName: {
        type: String
    },
    // --- NEW: Yeh array un users ki ID store karega jinhone message ko 'apne liye' delete kiya hai ---
    deletedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;