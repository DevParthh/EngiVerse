import User from '../models/userModel.js';
import FriendRequest from '../models/friendRequestModel.js';
import Notification from '../models/notificationModel.js';
import { getReceiverSocketId, io } from '../socket/socket.js'; 

export const sendFriendRequest = async (req, res) => {
    const requesterId = req.user.id;
    const recipientId = req.params.userId;

    if (requesterId === recipientId) {
        return res.status(400).json({ success: false, message: "Cannot request yourself." });
    }

    try {
        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ success: false, message: "User not found." });

        if (recipient.friends.includes(requesterId)) {
            return res.status(400).json({ success: false, message: "Already friends." });
        }

        // Check for existing request
        let request = await FriendRequest.findOne({
            $or: [
                { fromUser: requesterId, toUser: recipientId },
                { fromUser: recipientId, toUser: requesterId }
            ]
        });

        // Agar request pehle se hai
        if (request) {
            if (request.status === 'pending') {
                // Request hai, par notification shyd miss ho gayi ho, toh hum dubara notify kar denge
                // Lekin naya request create nahi karenge
                // Proceed to notification logic below...
                console.log("Request exists, resending notification if needed.");
            } else if (request.status === 'accepted') {
                return res.status(200).json({ success: true, message: "Already friends." });
            } else {
                // If rejected, allow resending? Let's reset to pending
                request.status = 'pending';
                request.fromUser = requesterId; // Ensure sender is correct
                request.toUser = recipientId;
                await request.save();
            }
        } else {
            // New Request
            request = await FriendRequest.create({ fromUser: requesterId, toUser: recipientId, status: 'pending' });
        }

        // --- NOTIFICATION LOGIC (Robust) ---
        const sender = await User.findById(requesterId);
        
        // Pehle check karo duplicate notification na bane
        const existingNotif = await Notification.findOne({
            sender: requesterId,
            recipient: recipientId,
            type: 'friend_request'
        });

        if (!existingNotif) {
            const notification = await Notification.create({
                recipient: recipientId,
                sender: requesterId,
                type: 'friend_request',
                title: 'New Connection Request',
                message: `${sender.name} sent you a friend request.`,
                link: `/profile/${requesterId}`
            });

            // Socket Emit
            const receiverSocketId = getReceiverSocketId(recipientId);
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
        }

        res.status(201).json({ success: true, message: "Friend request sent." });

    } catch (error) {
        console.error("Send Request Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ... Baki functions (respondToRequest, getPendingRequests, etc.) same rahenge. 
// Unhe change mat karna agar wo already sahi the.

export const respondToRequest = async (req, res) => {
    const currentUserId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; 

    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ success: false, message: "Request not found." });
        
        // Strict check: Only recipient can accept
        if (request.toUser.toString() !== currentUserId) {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }

        if (action === 'accept') {
            request.status = 'accepted';
            await request.save();

            await User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: request.fromUser } });
            await User.findByIdAndUpdate(request.fromUser, { $addToSet: { friends: currentUserId } });

            // Notification
            const currentUser = await User.findById(currentUserId);
            const notification = await Notification.create({
                recipient: request.fromUser,
                sender: currentUserId,
                type: 'friend_request_accepted',
                title: 'Request Accepted',
                message: `${currentUser.name} accepted your connection request.`,
                link: `/profile/${currentUserId}`
            });

            const receiverSocketId = getReceiverSocketId(request.fromUser.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", {
                    ...notification.toObject(),
                    sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture }
                });
            }

            return res.status(200).json({ success: true, message: "Accepted." });
        } 
        
        if (action === 'reject') {
            await FriendRequest.findByIdAndDelete(requestId); // Delete on reject to keep DB clean
            return res.status(200).json({ success: true, message: "Rejected." });
        }

    } catch (error) {
        console.error("Respond Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ toUser: req.user.id, status: 'pending' }).populate('fromUser', 'name profilePicture');
        res.status(200).json({ success: true, data: requests });
    } catch (error) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const getFriendsList = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'name profilePicture collegeName');
        const validFriends = user ? user.friends.filter(f => f !== null) : [];
        res.status(200).json({ success: true, data: validFriends });
    } catch (error) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const withdrawRequest = async (req, res) => {
    const requesterId = req.user.id;
    const recipientId = req.params.recipientId;
    try {
        await FriendRequest.findOneAndDelete({ fromUser: requesterId, toUser: recipientId, status: 'pending' });
        await Notification.findOneAndDelete({ sender: requesterId, recipient: recipientId, type: 'friend_request' });
        res.status(200).json({ success: true, message: "Withdrawn." });
    } catch (error) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const unfriendUser = async (req, res) => {
    const currentUserId = req.user.id;
    const { friendId } = req.params;
    try {
        await User.findByIdAndUpdate(currentUserId, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: currentUserId } });
        await FriendRequest.deleteMany({
            $or: [{ fromUser: currentUserId, toUser: friendId }, { fromUser: friendId, toUser: currentUserId }]
        });
        res.status(200).json({ success: true, message: "Removed." });
    } catch (error) { res.status(500).json({ success: false, message: "Server error." }); }
};