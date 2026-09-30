import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Context fields (New)
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: {
        type: String,
        enum: ['new_offer', 'offer_accepted', 'friend_request', 'friend_request_accepted', 'badge_awarded', 'system_alert'],
        required: true,
    },
    link: { 
        type: String, 
        required: true 
    },
    relatedId: { 
        type: Schema.Types.ObjectId, 
        default: null // Optional: ID of the Job, Resume, or User involved
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;