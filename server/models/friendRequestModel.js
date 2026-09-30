import mongoose from 'mongoose';
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

// Ek user doosre ko ek hi pending request bhej sakta hai
friendRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
export default FriendRequest;
