// Filename: server/routes/offerRoutes.js

import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createOffer, getOffersForTask } from "../controllers/offerController.js";

const router = express.Router({ mergeParams: true });

// GET /api/tasks/:taskId/offers -> Get all offers for a task
router.get("/", getOffersForTask); 

// POST /api/tasks/:taskId/offers -> Create a new offer for a task
router.post("/", userAuth, createOffer);

export default router;