import Notification from '../models/notificationModel.js';

// @desc    Get notifications for a user (Context-Aware)
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name profilePicture') // Sender details for UI
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Increased limit for detailed view history

        // Count unread for the badge
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.status(200).json({ 
            success: true, 
            data: notifications,
            unreadCount 
        });
    } catch (error) {
        console.error("Get Notifs Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Mark specific or all notifications as read
export const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { $set: { isRead: true } }
        );
        
        res.status(200).json({ success: true, message: "Notifications marked as read." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Delete a SINGLE notification
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Ensure user can only delete their OWN notification
        const deleted = await Notification.findOneAndDelete({ _id: id, recipient: userId });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Notification not found or unauthorized." });
        }

        res.status(200).json({ success: true, message: "Notification removed." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Clear ALL notifications for current user
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Only deletes where recipient matches current user
        await Notification.deleteMany({ recipient: userId });

        res.status(200).json({ success: true, message: "All notifications cleared." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};