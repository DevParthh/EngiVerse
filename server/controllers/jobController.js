import { fetchAllJobsAndSave } from '../services/jobService.js';
import jobModel from '../models/jobModel.js';
import userModel from '../models/userModel.js';

// --- CONFIGURATION ---
const SYNC_COOLDOWN_MINUTES = 60; 
const MONTHLY_LIMIT = 5; 

// 1. Trigger Fetch
export const triggerJobFetch = async (req, res) => {
    try {
        // --- FIX: Read from req.userId (set by middleware) ---
        const userId = req.userId || req.body.userId; 
        
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        // A. Initialize Quota if missing
        if (!user.fetchQuota) {
            user.fetchQuota = { count: 0, lastReset: new Date() };
            await user.save();
        }

        // B. Reset Quota Logic
        const now = new Date();
        const lastReset = new Date(user.fetchQuota.lastReset || Date.now());
        const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
        
        if (daysSinceReset >= 30) {
            user.fetchQuota.count = 0;
            user.fetchQuota.lastReset = now;
            await user.save();
        }

        // C. Check Limit
        if (user.fetchQuota.count >= MONTHLY_LIMIT) {
            return res.status(200).json({
                success: false,
                isLimitReached: true,
                message: `Monthly quota exceeded (${MONTHLY_LIMIT}/${MONTHLY_LIMIT}). Try again next month.`
            });
        }

        // D. Check Time Cooldown
        const lastAddedJob = await jobModel.findOne().sort({ updatedAt: -1 });
        if (lastAddedJob) {
            const timeDiff = now.getTime() - new Date(lastAddedJob.updatedAt).getTime();
            const cooldownMs = SYNC_COOLDOWN_MINUTES * 60 * 1000;

            if (timeDiff < cooldownMs) {
                const minutesLeft = Math.ceil((cooldownMs - timeDiff) / 60000);
                return res.status(200).json({ 
                    success: false, 
                    isRateLimited: true,
                    minutesLeft,
                    message: `Database is fresh. Next update available in ${minutesLeft} mins.`
                });
            }
        }

        // E. Perform Fetch
        const result = await fetchAllJobsAndSave();

        // F. Update Quota
        user.fetchQuota.count += 1;
        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: "Jobs fetched successfully!", 
            data: result,
            remaining: MONTHLY_LIMIT - user.fetchQuota.count
        });

    } catch (error) {
        console.error("Job Trigger Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get User Quota (GET Request - Yahi fail ho raha tha)
export const getUserQuota = async (req, res) => {
    try {
        // --- FIX: Read from req.userId ---
        // GET Request me req.body nahi hota, isliye req.userId use karna zaroori hai
        const userId = req.userId || req.body.userId; 

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false });

        const usedCount = (user.fetchQuota && user.fetchQuota.count) ? user.fetchQuota.count : 0;

        return res.status(200).json({
            success: true,
            used: usedCount,
            limit: MONTHLY_LIMIT
        });
    } catch (error) {
        console.error("Quota Error:", error);
        return res.status(500).json({ success: false });
    }
};

// 3. Get All Jobs
export const getAllJobs = async (req, res) => {
    try {
        const { search, jobType, location, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        if (jobType) {
            const types = jobType.split(',').map(t => new RegExp(`^${t.trim()}$`, 'i'));
            query.jobType = { $in: types };
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const jobs = await jobModel.find(query)
            .sort({ postedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
            
        const total = await jobModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: jobs,
            totalJobs: total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching jobs" });
    }
};

// 4. Get New Jobs Count
export const getNewJobsCount = async (req, res) => {
    try {
        const { since } = req.query;
        if (!since) return res.status(200).json({ success: true, data: { count: 0 } });
        
        const count = await jobModel.countDocuments({ createdAt: { $gt: new Date(Number(since)) } });
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
};