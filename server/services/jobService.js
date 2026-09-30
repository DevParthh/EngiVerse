import axios from 'axios';
import jobModel from '../models/jobModel.js';
import savedJobModel from '../models/savedJobModel.js';

// Ensure variable matches your .env file exactly
const API_KEY = process.env.RAPIDAPI_KEY; 

export const fetchAllJobsAndSave = async (query = 'Software Engineer') => {
    try {
        let cleanJobs = [];
        let sourceUsed = "None";

        // ---------------------------------------------------------
        // 1. TRY REAL API (JSearch)
        // ---------------------------------------------------------
        if (API_KEY) {
            console.log("📡 Connecting to JSearch API...");
            try {
                const options = {
                    method: 'GET',
                    url: 'https://jsearch.p.rapidapi.com/search',
                    params: {
                        query: `${query} in India`,
                        page: '1',
                        num_pages: '1',
                        date_posted: 'today'
                    },
                    headers: {
                        'X-RapidAPI-Key': API_KEY,
                        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                    }
                };

                const response = await axios.request(options);
                const apiJobs = response.data.data || [];

                if (apiJobs.length > 0) {
                    sourceUsed = "JSearch API";
                    
                    cleanJobs = apiJobs.map(job => {
                        // FIX: Strict Link Priority
                        // Agar direct link hai toh wahi lo, warna Google Jobs link
                        let finalLink = job.job_apply_link || job.job_google_link;

                        return {
                            jobId: job.job_id, 
                            title: job.job_title,
                            company: job.employer_name,
                            location: job.job_city ? `${job.job_city}, ${job.job_country}` : (job.job_country || 'Remote'),
                            jobType: job.job_employment_type || 'Full-time',
                            description: job.job_description ? job.job_description.substring(0, 500) + "..." : "No description available",
                            applyLink: finalLink, 
                            employer_logo: job.employer_logo,
                            source: 'JSearch',
                            postedAt: new Date()
                        };
                    });
                }
            } catch (apiError) {
                console.error("⚠️ API Error (Using Fallback):", apiError.message);
            }
        }

        // ---------------------------------------------------------
        // 2. FALLBACK MOCK DATA (Server Crash Proof)
        // ---------------------------------------------------------
        if (cleanJobs.length === 0) {
            console.log("⚠️ Using Static Mock Data...");
            sourceUsed = "Mock Data";
            
            cleanJobs = [
                {
                    jobId: "static-mock-1",
                    title: "Frontend Developer (React)",
                    company: "Microsoft",
                    location: "Bangalore, India",
                    jobType: "Full-time",
                    description: "Experience with React.js, Redux, and Tailwind CSS required...",
                    applyLink: "https://careers.microsoft.com/us/en", // Direct Link
                    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
                    source: "Mock",
                    postedAt: new Date()
                },
                {
                    jobId: "static-mock-2",
                    title: "Backend Engineer (Node.js)",
                    company: "Swiggy",
                    location: "Remote",
                    jobType: "Full-time",
                    description: "Building scalable APIs using Node.js and MongoDB...",
                    applyLink: "https://www.swiggy.com/careers", // Direct Link
                    employer_logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
                    source: "Mock",
                    postedAt: new Date()
                }
            ];
        }

        // ---------------------------------------------------------
        // 3. DATABASE SAVE (Upsert Strategy)
        // ---------------------------------------------------------
        if (cleanJobs.length > 0) {
            const operations = cleanJobs.map(job => ({
                updateOne: {
                    filter: { jobId: job.jobId },
                    update: { $set: job },
                    upsert: true
                }
            }));
            await jobModel.bulkWrite(operations);
        }

        // 4. CLEANUP
        try {
            const activeSavedJobIds = await savedJobModel.distinct('jobId');
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() - 30);

            await jobModel.deleteMany({
                createdAt: { $lt: expiryDate },
                _id: { $nin: activeSavedJobIds }
            });
        } catch (cleanupError) {
            console.warn("Cleanup warning:", cleanupError.message);
        }
        
        return { count: cleanJobs.length, source: sourceUsed };

    } catch (error) {
        // IMPORTANT: Catch duplicate errors gracefully
        if (error.code === 11000) {
            console.warn("⚠️ Duplicate Data skipped.");
            return { count: 0 };
        }
        console.error("❌ Critical Job Service Error:", error.message);
        // Throwing error allows Controller to send 500 response
        throw new Error("Job Sync Failed: " + error.message);
    }
};