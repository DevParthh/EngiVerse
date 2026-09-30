import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import Offer from "../models/offerModel.js";
import Notification from "../models/notificationModel.js";
import Conversation from "../models/conversationModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js"; 

// @desc    Create a new task & Notify Everyone
export const createTask = async (req, res) => {
  try {
    const { title, description, skills, bounty } = req.body;
    const seekerId = req.user.id;

    if (!title || !description || !skills || skills.length === 0 || bounty === undefined) {
      return res.status(400).json({ success: false, message: "Please provide all fields." });
    }

    const bountyAmount = Number(bounty);
    if (isNaN(bountyAmount) || bountyAmount < 10) return res.status(400).json({ success: false, message: "Minimum bounty is 10 Coins." });

    const seeker = await User.findById(seekerId);
    
    // --- FIX: ESCROW LOGIC (Deduct Immediately) ---
    if (seeker.engiCoins < bountyAmount) {
        return res.status(400).json({ success: false, message: `Insufficient EngiCoins! You have ${seeker.engiCoins}, need ${bountyAmount}.` });
    }

    // 1. Deduct Coins First
    seeker.engiCoins -= bountyAmount;
    await seeker.save();

    // 2. Create Task
    const task = await Task.create({ 
        title, description, skills, bounty: bountyAmount, user: seekerId, status: 'open' 
    });

    // Notify all users (except creator)
    const allUsers = await User.find({ _id: { $ne: seekerId } }).select('_id');
    if (allUsers.length > 0) {
        const notifications = allUsers.map(u => ({
            recipient: u._id,
            sender: seekerId,
            type: 'system_alert', 
            title: 'New Task Posted!',
            message: `${seeker.name} posted: "${title.substring(0, 30)}..." for ${bountyAmount} Coins.`,
            link: `/community/tasks/${task._id}`,
            createdAt: new Date()
        }));
        try {
            await Notification.insertMany(notifications);
            io.emit("newTaskAlert", { message: `New Task: ${title}`, link: `/community/tasks/${task._id}` });
        } catch (err) { console.error("Notif Error:", err); }
    }

    res.status(201).json({ success: true, message: `Task posted! ${bountyAmount} Coins deducted.`, data: task });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get all open tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: "open" })
      .sort({ createdAt: -1 })
      .populate("user", "name profilePicture");
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error."});
  }
};

// @desc    Get single task
export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) return res.status(400).json({ success: false, message: "Invalid ID." });
    
    const task = await Task.findById(taskId).populate("user", "name profilePicture collegeName");
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error."});
  }
};

// @desc    Get user's tasks
export const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({
            $or: [{ user: userId }, { assignedTo: userId }]
        })
        .sort({ updatedAt: -1 })
        .populate("user", "name profilePicture")
        .populate("assignedTo", "name profilePicture");

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Delete Task & Refund Money
export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const task = await Task.findById(taskId);

        if (!task) return res.status(404).json({ success: false, message: "Task not found." });
        if (task.user.toString() !== userId) return res.status(403).json({ success: false, message: "Not authorized." });
        if (task.status === 'completed') return res.status(400).json({ success: false, message: "Cannot delete completed task." });

        // --- FIX: REFUND LOGIC ---
        // If task is open or even in progress (forcing delete), refund the owner
        const refundAmount = task.bounty;
        const user = await User.findById(userId);
        
        user.engiCoins += refundAmount;
        await user.save();

        await Offer.deleteMany({ task: taskId });
        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ success: true, message: `Task deleted. ${refundAmount} Coins refunded to wallet.` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Update Task & Handle Money Difference
export const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const { title, description, skills, bounty } = req.body;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: "Task not found." });
        if (task.user.toString() !== userId) return res.status(403).json({ success: false, message: "Not authorized." });
        if (task.status !== 'open') return res.status(400).json({ success: false, message: "Can only edit open tasks." });

        // --- FIX: MONEY UPDATE LOGIC ---
        if (bounty !== undefined) {
            const newBounty = Number(bounty);
            const oldBounty = task.bounty;
            const diff = newBounty - oldBounty;

            const user = await User.findById(userId);

            if (diff > 0) {
                // Price Increased: Deduct more
                if (user.engiCoins < diff) {
                    return res.status(400).json({ success: false, message: `Insufficient balance to increase bounty by ${diff}.` });
                }
                user.engiCoins -= diff;
            } else if (diff < 0) {
                // Price Decreased: Refund difference
                user.engiCoins += Math.abs(diff);
            }
            
            await user.save();
            task.bounty = newBounty;
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.skills = skills || task.skills;

        await task.save();
        res.status(200).json({ success: true, message: "Task updated.", data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Accept Offer & Notify Helper
export const acceptOffer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { taskId } = req.params;
        const { offerId } = req.body;
        const userId = req.user.id; // Owner ID

        const task = await Task.findById(taskId).session(session);
        const offer = await Offer.findById(offerId).session(session);

        if (!task || !offer) throw new Error("Not found.");
        if (task.user.toString() !== userId) throw new Error("Not authorized.");
        if (task.status !== 'open') throw new Error("Task not open.");

        // 1. Update Status
        task.status = 'in_progress';
        task.assignedTo = offer.user; // Helper ID

        offer.status = 'accepted';
        await offer.save({ session });
        await Offer.updateMany({ task: taskId, _id: { $ne: offerId } }, { status: 'rejected' }).session(session);

        // 2. Chat Logic
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, offer.user] }
        }).session(session);

        if (!conversation) {
            const newConv = await Conversation.create([{
                participants: [userId, offer.user], 
                relatedTask: taskId, 
                lastMessage: { 
                    text: `Offer accepted for task: "${task.title}". You can start chatting here.`, 
                    sender: userId, 
                    createdAt: new Date() 
                }
            }], { session });
            conversation = newConv[0];
        } else {
            conversation.lastMessage = {
                text: `Offer accepted for task: "${task.title}".`,
                sender: userId,
                createdAt: new Date()
            };
            await conversation.save({ session });
        }

        task.conversationId = conversation._id;
        await task.save({ session });

        await session.commitTransaction();

        // 3. Notification
        const taskOwner = await User.findById(userId);
        const notif = await Notification.create({
            recipient: offer.user,
            sender: userId,
            type: 'offer_accepted', 
            title: 'Offer Accepted! 🚀',
            message: `${taskOwner.name} hired you for "${task.title}".`,
            link: `/community/tasks/${taskId}` 
        });

        const socketId = getReceiverSocketId(offer.user.toString());
        if (socketId) io.to(socketId).emit("newNotification", notif);

        res.status(200).json({ success: true, message: "Offer accepted!", chatId: conversation._id });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally { session.endSession(); }
};

// @desc    Complete Task & Release Payment
export const completeTask = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { taskId } = req.params;
        const taskOwnerId = req.user.id;

        const task = await Task.findById(taskId).session(session);
        const owner = await User.findById(taskOwnerId).session(session);

        if (!task || task.user.toString() !== taskOwnerId || task.status !== 'in_progress') {
            throw new Error("Invalid task state.");
        }

        // --- FIX: PAYMENT LOGIC ---
        // Owner ke paise already kat chuke hain 'createTask' me.
        // Hum bas Helper ko add karenge.
        
        const helperId = task.assignedTo;
        const helper = await User.findById(helperId).session(session);

        // helper.engiCoins += task.bounty; 
        // (Is line ko niche logic ke sath likha hai)

        helper.engiCoins += task.bounty;
        task.status = 'completed';
        task.completedAt = Date.now();
        
        await helper.save({ session });
        await task.save({ session });
        
        await session.commitTransaction();

        // Notify Helper (Payment)
        const paymentNotif = await Notification.create({
            recipient: helperId,
            sender: taskOwnerId,
            type: 'new_offer',
            title: 'Payment Received! 💰',
            message: `Task "${task.title}" completed. You received ${task.bounty} EngiCoins.`,
            link: `/profile/${helperId}`
        });

        const socketId = getReceiverSocketId(helperId.toString());
        if (socketId) io.to(socketId).emit("newNotification", paymentNotif);

        res.status(200).json({ success: true, message: "Task completed. Payment released to Helper." });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally { session.endSession(); }
};