import express from "express";
import userAuth from "../middleware/userAuth.js";
import { triggerJobFetch, getAllJobs, getNewJobsCount, getUserQuota } from "../controllers/jobController.js";

const jobRouter = express.Router();

jobRouter.get("/", userAuth, getAllJobs);
jobRouter.get("/new-count", userAuth, getNewJobsCount);
jobRouter.get("/quota", userAuth, getUserQuota); // NEW
jobRouter.post("/refresh", userAuth, triggerJobFetch);

export default jobRouter;