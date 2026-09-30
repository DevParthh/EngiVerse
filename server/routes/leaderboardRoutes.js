import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getLeaderboardData } from "../controllers/leaderboardController.js";

const router = express.Router();

// GET /api/leaderboard
router.get("/", userAuth, getLeaderboardData);

export default router;
