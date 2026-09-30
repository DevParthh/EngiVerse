import userModel from "../models/userModel.js";
import FriendRequest from "../models/friendRequestModel.js"; 
import bcrypt from "bcryptjs";

// --- 🔥 STEP 1: IMPORT ALL MODELS (Total Cleanup ke liye) ---
import Task from "../models/taskModel.js";
import Offer from "../models/offerModel.js";
import Notification from "../models/notificationModel.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import InterviewSession from "../models/interviewSessionModel.js";
import MarketItem from "../models/MarketItem.js";
import Resume from "../models/resumeModel.js";
import SavedJob from "../models/savedJobModel.js";
// (Note: jobModel.js usually contains fetched jobs, not user data, so we skip it unless users post jobs)

// @desc    Get Current User Data (Full Profile)
export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; 
    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
        success: true, 
        userData: { 
            _id: user._id,
            name: user.name, 
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            profilePicture: user.profilePicture,
            collegeName: user.collegeName,
            branch: user.branch,
            skills: user.skills,
            bio: user.bio,
            badges: user.badges,
            socialLinks: user.socialLinks,
            engiCoins: user.engiCoins,
            graduationYear: user.graduationYear,
            friends: user.friends,
            fetchQuota: user.fetchQuota 
        } 
    });
  } catch (error) { 
    console.error("Error in getUserData:", error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

// @desc    Update User Profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, collegeName, branch, skills, bio, socialLinks, graduationYear } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (name) user.name = name;
        if (collegeName) user.collegeName = collegeName;
        if (branch) user.branch = branch;
        if (bio) user.bio = bio;
        if (graduationYear) user.graduationYear = graduationYear;

        if (skills) {
            user.skills = Array.isArray(skills) 
                ? skills 
                : skills.split(',').map(skill => skill.trim()).filter(Boolean);
        }

        if (socialLinks) {
            user.socialLinks = { ...user.socialLinks, ...socialLinks };
        }

        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully", 
            userData: user 
        });

    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Explore other users
export const exploreUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { name, branch, skills, college } = req.query;

        let queryOptions = { _id: { $ne: loggedInUserId } };

        if (name) queryOptions.name = { $regex: name, $options: 'i' };
        if (branch) queryOptions.branch = { $regex: branch, $options: 'i' };
        if (college) queryOptions.collegeName = { $regex: college, $options: 'i' };
        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim());
            queryOptions.skills = { $in: skillsArray };
        }
        
        const loggedInUser = await userModel.findById(loggedInUserId).select('friends');
        const friendsSet = new Set(loggedInUser ? loggedInUser.friends.map(id => id.toString()) : []);

        const pendingRequests = await FriendRequest.find({
            $or: [
                { fromUser: loggedInUserId, status: 'pending' }, 
                { toUser: loggedInUserId, status: 'pending' }
            ]
        });

        const requestMap = {};
        pendingRequests.forEach(req => {
            if (req.fromUser.toString() === loggedInUserId) {
                requestMap[req.toUser.toString()] = 'request_sent_by_me';
            } else {
                requestMap[req.fromUser.toString()] = 'request_received';
            }
        });

        const users = await userModel.find(queryOptions).select('-password -verifyOtp -resetOtp').lean();
        
        const usersWithStatus = users.map(user => {
            const userIdStr = user._id.toString();
            let friendshipStatus = 'not_friends';

            if (friendsSet.has(userIdStr)) {
                friendshipStatus = 'friends';
            } else if (requestMap[userIdStr]) {
                friendshipStatus = requestMap[userIdStr];
            }

            return { ...user, friendshipStatus };
        });

        res.status(200).json({ success: true, data: usersWithStatus });

    } catch (error) {
        console.error("Error in exploreUsers:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc Change Password
export const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await userModel.findById(userId).select('+password');
        if (!user) return res.json({ success: false, message: "User not found" });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.json({ success: false, message: "Incorrect current password" });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.json({ success: true, message: "Password updated successfully" });
    } catch (error) { return res.json({ success: false, message: error.message }); }
};

// --- 🔥 STEP 2: THE ULTIMATE DELETE FUNCTION ---
// @desc    Delete Account & All Related Data (Cascading Delete)
export const deleteAccount = async (req, res) => {
    try {
        // Auth middleware se req.user.id milta hai, body se lene ki zaroorat nahi hai usually
        // Lekin agar tumhara frontend body me bhej raha hai toh fallback rakha hai.
        const userId = req.user.id || req.body.userId; 

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID missing." });
        }
        
        console.log(`Starting account deletion for User ID: ${userId}`);

        // 1. Delete Tasks (Created by user)
        await Task.deleteMany({ user: userId });
        
        // 2. Delete Offers (Made by user)
        await Offer.deleteMany({ user: userId });

        // 3. Delete Friend Requests (Sent OR Received)
        await FriendRequest.deleteMany({ 
            $or: [{ fromUser: userId }, { toUser: userId }] 
        });

        // 4. Delete Notifications (Received by user)
        await Notification.deleteMany({ recipient: userId });

        // 5. Delete Conversations & Messages
        // (Nuclear option: Delete any chat they are part of to avoid 'null' user crash)
        await Conversation.deleteMany({ participants: userId });
        await Message.deleteMany({ sender: userId });

        // 6. Delete Interview Sessions
        await InterviewSession.deleteMany({ userId: userId });
        
        // 7. Delete Market Items (Uploaded by user)
        // (Check your MarketItem schema if field is 'sellerId' or 'user'. I used 'sellerId' based on typical logic, change if needed)
        await MarketItem.deleteMany({ sellerId: userId });

        // 8. Delete Resumes
        await Resume.deleteMany({ user: userId });

        // 9. Delete Saved Jobs
        await SavedJob.deleteMany({ user: userId });

        // 10. Finally, Delete the User
        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User already deleted or not found." });
        }

        console.log(`Successfully deleted account for: ${deletedUser.email}`);
        return res.json({ success: true, message: "Account and all associated data deleted successfully." });

    } catch (error) { 
        console.error("Delete Account Error:", error);
        return res.status(500).json({ success: false, message: error.message }); 
    }
};