import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createTask,
  getAllTasks,
  getTaskById,
  acceptOffer,
  completeTask,
  getMyTasks, 
  deleteTask,
  updateTask
} from "../controllers/taskController.js";

// Offer Controller directly import kar rahe hain taaki routing simple rahe
import { getTaskOffers, createOffer } from "../controllers/offerController.js";

const router = express.Router();

// === PRIVATE ROUTES (Must be logged in) ===

// 1. Get User's Tasks (Must be before /:id to prevent conflict)
router.get("/mytasks", userAuth, getMyTasks); 

// 2. Create Task
router.post("/", userAuth, createTask);

// 3. Task Actions (Fixed: Changed PUT to POST to match Frontend)
router.post("/:taskId/accept-offer", userAuth, acceptOffer); 
router.post("/:taskId/complete", userAuth, completeTask);

// 4. Update & Delete
router.put("/:id", userAuth, updateTask);
router.delete("/:id", userAuth, deleteTask);

// 5. Offer Routes (Directly mapped here)
router.get("/:taskId/offers", getTaskOffers); 
router.post("/:taskId/offers", userAuth, createOffer);

// === PUBLIC ROUTES ===
router.get("/", getAllTasks);
router.get("/:id", getTaskById);

export default router;