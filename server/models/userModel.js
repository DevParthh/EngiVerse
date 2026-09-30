import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // --- Core Fields ---
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false },

  // --- Auth Fields ---
  verifyOtp: { type: String, select: false },
  verifyOtpExpireAt: { type: Number, select: false },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, select: false },
  resetOtpExpireAt: { type: Number, select: false },

  // --- Profile Fields ---
  engiCoins: { type: Number, default: 50 },
  badges: [{ type: String }],
  collegeName: { type: String, trim: true, default: '' },
  branch: { type: String, trim: true, default: '' },
  
  // --- FIX: Min year changed from 2020 to 1980 ---
  graduationYear: { type: Number, min: 1980, max: 2030 }, 
  
  skills: { type: [String], default: [] },
  profilePicture: { type: String, default: '' },
  bio: { type: String, maxLength: 500, trim: true, default: '' },
  socialLinks: {
    linkedIn: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' }
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // --- Quota Tracking ---
  fetchQuota: {
    count: { type: Number, default: 0 }, 
    lastReset: { type: Date, default: Date.now } 
  }

}, { timestamps: true });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;