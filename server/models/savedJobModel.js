import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Make sure your User model is exported as 'user' (lowercase) or change to 'User'
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',  // Matches the model name in jobModel.js
        required: true
    }
}, {
    timestamps: true 
});


savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const savedJobModel = mongoose.models.savedJob || mongoose.model('savedJob', savedJobSchema);

export default savedJobModel;