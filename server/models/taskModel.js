import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: [true, "Task title is required."],
        trim: true,
        maxlength: [100, "Title cannot be more than 100 characters."],
    },
    description: {
        type: String,
        required: [true, "Task description is required."],
        maxlength: [2000, "Description cannot be more than 2000 characters."],
    },
    skills: {
        type: [String],
        required: [true, "At least one skill is required."],
    },
    // --- NEW: Attachments (Images/Docs from Cloudinary) ---
    attachments: [{
        type: String, // URL
    }],
    bounty: { 
        type: Number, 
        required: true, 
        min: [10, "Minimum bounty is 10 EngiCoins"] 
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "review", "completed", "cancelled"], // Added 'review'
        default: "open",
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    // Connects to the Chat Module
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        default: null
    },
    completedAt: { type: Date },
}, { timestamps: true });

// Indexing for faster search filters
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ skills: 1 });
taskSchema.index({ status: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;