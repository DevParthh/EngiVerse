// Filename: server/routes/messageRoutes.js (CORRECTED)

import express from 'express';
import userAuth from '../middleware/userAuth.js';
// Import the specific uploader for chat files
import { uploadChatFile } from '../middleware/multer.js';
import {
    getConversations,
    getMessages,
    sendMessage,
    sendFile,
    clearChat,
    deleteConversations
} from '../controllers/messageController.js';

const router = express.Router();

router.use(userAuth);

router.get('/conversations', getConversations);
router.get('/:recipientId', getMessages);
router.post('/send/:recipientId', sendMessage);

// Use the correct 'uploadChatFile' middleware here
router.post('/send-file/:recipientId', uploadChatFile.single('file'), sendFile);

router.put('/clear/:conversationId', clearChat);
router.post("/delete-conversations", deleteConversations);

// The export must be at the end of the file
export default router;