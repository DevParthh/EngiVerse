import Offer from "../models/offerModel.js";
import Task from "../models/taskModel.js";
import Notification from "../models/notificationModel.js"; // Added
import User from "../models/userModel.js"; // Added
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../socket/socket.js"; // Added for Real-time

/**
 * @desc    Create a new offer for a task
 * @route   POST /api/tasks/:taskId/offers
 * @access  Private
 */
export const createOffer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // 1. Validation
    if (!message) {
      return res.status(400).json({ success: false, message: "Offer message is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID." });
    }

    // 2. Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    // 3. Check: User cannot offer on their own task
    if (task.user.toString() === userId) {
        return res.status(400).json({ success: false, message: "You cannot make an offer on your own task." });
    }

    // 4. Check: Do not allow offers on non-open tasks
    if (task.status !== 'open') {
        return res.status(400).json({ success: false, message: "This task is not open for offers." });
    }

    // 5. Create and save the offer
    const offer = await Offer.create({
      task: taskId,
      user: userId,
      message,
    });

    // --- NOTIFICATION LOGIC ---
    try {
        const sender = await User.findById(userId); // Get sender details for name
        
        // Create Notification in DB
        const notification = await Notification.create({
            recipient: task.user, // Task Owner
            sender: userId,       // Person who offered
            type: 'new_offer',    // Make sure frontend handles this icon
            title: 'New Offer Received',
            message: `${sender.name} sent an offer for "${task.title}": ${message.substring(0, 30)}...`,
            link: `/community/tasks/${taskId}` // Link to Task Detail page
        });

        // Send Real-time Socket Event
        const receiverSocketId = getReceiverSocketId(task.user.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newNotification", {
                ...notification.toObject(),
                sender: {
                    _id: sender._id,
                    name: sender.name,
                    profilePicture: sender.profilePicture
                }
            });
        }
    } catch (notifError) {
        console.error("Notification Error (Offer):", notifError);
        // Continue execution even if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Offer submitted successfully.",
      data: offer,
    });

  } catch (error) {
    console.error("Error in createOffer:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating offer.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all offers for a specific task
 * @route   GET /api/tasks/:taskId/offers
 * @access  Public/Private
 */
export const getTaskOffers = async (req, res) => {
  try {
    const { taskId } = req.params;

    // 1. Validate the Task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID." });
    }
    
    // 2. Find all offers for the given task ID
    const offers = await Offer.find({ task: taskId })
      .sort({ createdAt: -1 })
      .populate("user", "name profilePicture");

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });

  } catch (error) {
    console.error("Error in getTaskOffers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching offers.",
      error: error.message,
    });
  }
};