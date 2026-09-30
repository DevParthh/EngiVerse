// Filename: server/models/interviewSessionModel.js (CORRECTED)
import mongoose from 'mongoose';
const { Schema } = mongoose;

const interviewSessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationHistory: [
        {
            role: { type: String, enum: ['user', 'model'], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        }
    ],
    topic: { type: String, default: 'General Technical' },
    finalReport: { type: String, default: '' },
    overallScore: { type: Number, default: 0 },
    status: {
        type: String,
        // --- FIX IS HERE: Added 'active' to the list ---
        enum: ['active', 'in_progress', 'completed'], 
        default: 'active',
    },
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;