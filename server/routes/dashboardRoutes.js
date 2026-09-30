// Filename: server/routes/dashboardRoutes.js

import express from "express";
import userAuth from "../middleware/userAuth.js"; // Aapka existing auth middleware
import { getDashboardData } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

// @desc    Get data for the user dashboard
// @route   GET /api/dashboard/
// @access  Private
dashboardRouter.get("/", userAuth, getDashboardData);

export default dashboardRouter;