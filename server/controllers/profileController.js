// Filename: server/controllers/profileController.js (COMPLETE VERSION)

import User from '../models/userModel.js';
import FriendRequest from '../models/friendRequestModel.js';
import mongoose from 'mongoose';

// @desc    Get user profile data
// @route   GET /api/profile/:userId?
// @desc    Get user profile data
// @route   GET /api/profile/:userId?
export const getProfile = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const profileUserId = req.params.userId || loggedInUserId;

        // --- FINAL FIX IS HERE (BACKEND) ---
        // 1. Check if the provided ID is a valid MongoDB ObjectId format.
        // If not, it's an invalid request (like "undefined").
        if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
            return res.status(404).json({ success: false, message: "User not found (Invalid ID)." });
        }

        // 2. Proceed with the valid ID
        const user = await User.findById(profileUserId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // ... (Friendship status logic remains the same)
        let friendship = null;
        if (loggedInUserId !== profileUserId) {
            const areFriends = user.friends.includes(loggedInUserId);
            if (areFriends) {
                friendship = { status: 'friends' };
            } else {
                const pendingRequest = await FriendRequest.findOne({
                    $or: [
                        { fromUser: loggedInUserId, toUser: profileUserId },
                        { fromUser: profileUserId, toUser: loggedInUserId }
                    ],
                    status: 'pending'
                });
                if (pendingRequest) {
                    if (pendingRequest.fromUser.toString() === loggedInUserId) {
                        friendship = { status: 'request_sent', requestId: pendingRequest._id };
                    } else {
                        friendship = { status: 'request_received', requestId: pendingRequest._id };
                    }
                } else {
                    friendship = { status: 'not_friends' };
                }
            }
        }
        
        // The data structure from your code was { user, friendship }, let's keep it
        // but ensure we send the user object directly, not nested inside another user object.
        const responseData = { ...user.toObject(), friendship };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        // This will now only catch real server errors, not CastError for "undefined"
        console.error("Error in getProfile:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Update user profile data
// @route   PUT /api/profile
export const updateProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.status(200).json({ success: true, message: "Profile updated successfully.", data: updatedUser });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ success: false, message: "Server error while updating profile." });
    }
};

// @desc    Upload a profile picture
// @route   POST /api/profile/upload-picture
export const uploadPicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided." });
        }
        
        // The file is uploaded to Cloudinary by multer, req.file.path contains the URL
        const profilePictureUrl = req.file.path;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: profilePictureUrl },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully.",
            data: { profilePicture: updatedUser.profilePicture }
        });
    } catch (error) {
        console.error("Error in uploadPicture:", error);
        res.status(500).json({ success: false, message: "Server error while uploading picture." });
    }
};