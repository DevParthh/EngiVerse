import mongoose from 'mongoose';
const { Schema } = mongoose;

const conversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    // Last message for preview in chat list
    lastMessage: {
        text: String,
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
    },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
