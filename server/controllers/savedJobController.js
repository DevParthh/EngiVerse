import savedJobModel from "../models/savedJobModel.js";
import jobModel from "../models/jobModel.js";

// ==========================================
// 1. SAVE A JOB (Bookmark)
// ==========================================
export const saveJob = async (req, res) => {
    try {
        const { userId, jobId } = req.body;

        if (!userId || !jobId) {
            return res.status(400).json({ success: false, message: "Invalid Request: Data missing" });
        }

        // Check if job exists
        const jobExists = await jobModel.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({ success: false, message: "Job no longer exists" });
        }

        // Check duplicates
        const alreadySaved = await savedJobModel.findOne({ userId, jobId });
        if (alreadySaved) {
            return res.status(400).json({ success: false, message: "Job already saved" });
        }

        const newSavedJob = new savedJobModel({ userId, jobId });
        await newSavedJob.save();

        return res.status(201).json({ success: true, message: "Job saved successfully" });

    } catch (error) {
        console.error("Error in saveJob:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. REMOVE SAVED JOB (Unsave) - Updated
// ==========================================
export const removeSavedJob = async (req, res) => {
    try {
        const { userId, jobId } = req.body;

        // Debugging log
        console.log("Removing Job -> User:", userId, "Job:", jobId);

        if (!userId || !jobId) {
            return res.status(400).json({ success: false, message: "Invalid Request: Missing ID" });
        }

        // Delete specific entry matching User AND Job
        const deleted = await savedJobModel.findOneAndDelete({ userId, jobId });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Job not found in saved list" });
        }

        return res.status(200).json({ success: true, message: "Job removed successfully" });

    } catch (error) {
        console.error("Error in removeSavedJob:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 3. GET ALL SAVED JOBS
// ==========================================
export const getSavedJobs = async (req, res) => {
    try {
        const { userId } = req.body;

        const savedJobs = await savedJobModel.find({ userId })
            .populate('jobId')
            .sort({ createdAt: -1 });

        // Filter out nulls (deleted jobs)
        const validJobs = savedJobs
            .filter(item => item.jobId !== null)
            .map(item => ({
                ...item.jobId._doc,
                savedJobId: item._id // keeping reference if needed
            }));

        return res.status(200).json({ success: true, data: validJobs });

    } catch (error) {
        console.error("Error in getSavedJobs:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching jobs" });
    }
};

export const getSavedJobIds = async (req, res) => {
    try {
        const { userId } = req.body;
        const saved = await savedJobModel.find({ userId }).select('jobId');
        const ids = saved.map(item => item.jobId ? item.jobId.toString() : null).filter(Boolean);
        return res.status(200).json({ success: true, data: ids });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error" });
    }
};