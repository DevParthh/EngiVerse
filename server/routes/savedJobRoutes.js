import express from "express";
import userAuth from "../middleware/userAuth.js";
// Note: Import 'removeSavedJob' instead of 'unsaveJob' to match the new Controller
import { saveJob, removeSavedJob, getSavedJobs, getSavedJobIds } from "../controllers/savedJobController.js";

const savedJobRouter = express.Router();

// 1. Save Job
// URL: POST /api/saved-jobs/
savedJobRouter.post("/", userAuth, saveJob);

// 2. Remove Saved Job (Updated)
// URL: POST /api/saved-jobs/remove
// Changed from DELETE to POST to handle body data correctly
savedJobRouter.post("/remove", userAuth, removeSavedJob);

// 3. Get All Saved Jobs
// URL: GET /api/saved-jobs/
savedJobRouter.get("/", userAuth, getSavedJobs);

// 4. Get Saved Job IDs (For UI Heart Icon)
// URL: GET /api/saved-jobs/ids
savedJobRouter.get("/ids", userAuth, getSavedJobIds);

export default savedJobRouter;