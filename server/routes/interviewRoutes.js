// Filename: server/routes/interviewRoutes.js (UPDATED)

import express from 'express';
import userAuth from '../middleware/userAuth.js';
// Naya function import karein
import { startInterviewSession, postChatMessage, getInterviewHistory,getInterviewReport, deleteInterviewSession} from '../controllers/interviewController.js';

const router = express.Router();
router.use(userAuth);

// Get all of a user's past interview sessions
router.get('/history', getInterviewHistory);

// Start a new interview session
router.post('/start', startInterviewSession);

// Post a message to an ongoing session
router.post('/chat/:sessionId', postChatMessage);

router.get('/:sessionId', getInterviewReport);

router.delete('/delete/:sessionId', deleteInterviewSession);

export default router;