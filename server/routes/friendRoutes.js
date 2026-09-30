// Filename: server/routes/friendRoutes.js

import express from 'express';
import userAuth from '../middleware/userAuth.js';
import {
    sendFriendRequest,
    getPendingRequests,
    respondToRequest,
    getFriendsList,
    withdrawRequest,
    unfriendUser
     // <-- Ise import karein
} from '../controllers/friendController.js';


const router = express.Router();

// All routes here are protected and start with /api/friends
router.use(userAuth);

// Get the user's friend list
router.get('/', getFriendsList);

// Get all incoming pending friend requests
router.get('/requests/pending', getPendingRequests);

// Send a friend request to a user
router.post('/requests/send/:userId', sendFriendRequest);

// Respond to a friend request (accept or reject)
router.put('/requests/respond/:requestId', respondToRequest);

// Withdraw a sent friend request
router.delete('/requests/withdraw/:recipientId', withdrawRequest); 
export default router;

router.delete('/:friendId', unfriendUser);