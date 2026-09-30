import express from 'express';
import { 
    createItem, 
    getMarketplaceItems, 
    purchaseItem, 
    addItemReview, 
    deleteItemReview 
} from '../controllers/marketplaceController.js';

import userAuth from '../middleware/userAuth.js'; 
import { uploadMarket } from '../config/cloudinary.js'; 

const marketplaceRouter = express.Router();

// 🔥 UPDATED: Error Catching Wrapper for Multiple Uploads
const uploadMiddleware = (req, res, next) => {
    // .fields() allows multiple files with different keys
    uploadMarket.fields([
        { name: 'file', maxCount: 1 },       // Main Project ZIP/PDF
        { name: 'coverImage', maxCount: 1 }  // Cover Image (Thumbnail)
    ])(req, res, (err) => {
        if (err) {
            console.error("❌ Upload Error:", JSON.stringify(err, null, 2));
            return res.status(500).json({ success: false, message: "File Upload Failed", error: err.message });
        }
        next();
    });
};

// Routes
marketplaceRouter.post('/create', userAuth, uploadMiddleware, createItem);
marketplaceRouter.get('/items', userAuth, getMarketplaceItems);
marketplaceRouter.post('/buy', userAuth, purchaseItem);
marketplaceRouter.post('/review', userAuth, addItemReview);
marketplaceRouter.post('/review/delete', userAuth, deleteItemReview);

export default marketplaceRouter;