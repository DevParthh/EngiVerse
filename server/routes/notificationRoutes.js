import express from 'express';
import userAuth from '../middleware/userAuth.js'; 
import { 
    getNotifications, 
    markNotificationsAsRead, 
    deleteNotification, 
    clearAllNotifications 
} from '../controllers/notificationController.js';

const router = express.Router();

// GET all (with unread count)
router.get('/', userAuth, getNotifications);

// Mark as read
router.put('/read', userAuth, markNotificationsAsRead);

// Delete single notification
router.delete('/:id', userAuth, deleteNotification);

// Clear all notifications (User specific)
router.delete('/clear/all', userAuth, clearAllNotifications);

export default router;