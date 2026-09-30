import express from 'express';

// 1. Database & CRUD Logic imports (from resumeController)
import { 
    createResume, 
    getResumeById, 
    updateResume, 
    getUserResumes, 
    deleteResume, 
    getPublicResumeById 
} from '../controllers/resumeController.js';

// 2. AI Logic imports (from NEW aiController)
import { 
    enhanceProfessionalSummary,
    enhanceJobDescription, // <-- Yeh naya function add kiya hai humne
    parseResumeFromPDF 
} from '../controllers/aiController.js';

import userAuth from '../middleware/userAuth.js';

// Image Upload Middleware
import { uploadResumeImage } from '../middleware/multer.js'; 

const router = express.Router();

// --- CRUD ROUTES ---
router.post('/create', userAuth, createResume);
router.get('/get/:resumeId', userAuth, getResumeById);

// Update route with Image Upload
router.put('/update', userAuth, uploadResumeImage.single('image'), updateResume);

router.get('/all', userAuth, getUserResumes);
router.delete('/delete/:resumeId', userAuth, deleteResume);
router.get('/public/:resumeId', getPublicResumeById);

// --- AI ROUTES (Now pointing to aiController) ---
router.post('/enhance-summary', userAuth, enhanceProfessionalSummary);
router.post('/enhance-job-description', userAuth, enhanceJobDescription); // <-- Frontend iske liye call kar raha tha
router.post('/parse', userAuth, parseResumeFromPDF);

export default router;