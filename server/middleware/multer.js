import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EngiVerse/profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) =>
      `profile_${Date.now()}_${file.originalname.split(".")[0]}`
  }
});

const chatFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EngiVerse/chat_files",
    resource_type: "auto"
  }
});

// 🔥 CHANGE: Disk Storage hata kar Memory Storage kar diya.
// Ab file 'uploads' folder me nahi, seedha RAM me aayegi.
// Isse ENOENT error production pe nahi aayega.
const resumeStorage = multer.memoryStorage();

export const uploadProfilePicture = multer({
  storage: profilePictureStorage
});

export const uploadChatFile = multer({
  storage: chatFileStorage
});

export const uploadResumeImage = multer({
  storage: resumeStorage
});