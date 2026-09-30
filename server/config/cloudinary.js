import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import 'dotenv/config';

// 1. Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage for Profile Pictures (Images Only)
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'EngiVerse/profile_pictures',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

// 3. Storage for Marketplace (PDF, ZIP, DOCS allowed) 🔥 FIX IS HERE
const marketStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // 🔥 Is function se hum bata rahe hain ki ye "auto" file hai (PDF/Video/Zip)
        return {
            folder: 'EngiVerse/Marketplace',
            resource_type: 'auto', 
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // Unique Name
        };
    },
});

// 4. Create Middlewares
export const uploadProfile = multer({ storage: profileStorage });
export const uploadMarket = multer({ storage: marketStorage });