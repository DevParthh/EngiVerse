import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    jobId: { 
        type: String, 
        required: true, 
        unique: true, // Sirf yeh unique rahega
        index: true 
    },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, default: 'Full-time' },
    description: { type: String, default: "No description available." },
    applyLink: { type: String }, 
    employer_logo: { type: String, default: '' },
    source: { type: String, default: 'External' }, 
    postedAt: { type: Date, default: Date.now }
}, { 
    timestamps: true 
});

// Text Search Index
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

const jobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default jobModel;