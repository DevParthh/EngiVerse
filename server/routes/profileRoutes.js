// Filename: server/routes/profileRoutes.js (CORRECTED)

import express from 'express';
import userAuth from '../middleware/userAuth.js';
// Import the specific uploader for profile pictures
import { uploadProfilePicture } from '../middleware/multer.js';
import { getProfile, updateProfile, uploadPicture } from '../controllers/profileController.js';

const router = express.Router();

router.get('/', userAuth, getProfile);
router.get('/:userId', userAuth, getProfile);
router.put('/', userAuth, updateProfile);

// Use the correct 'uploadProfilePicture' middleware here
router.post('/upload-picture', userAuth, uploadProfilePicture.single('profilePicture'), uploadPicture);

export default router;