import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplate.js";

// --- REGISTER CONTROLLER ---
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 🔥 FIXED: Cookie Settings for Cross-Site (Vercel -> Render)
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Hamesha true rakho Render (HTTPS) ke liye
        sameSite: 'none', // Cross-origin requests ke liye zaroori hai
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("token", token, cookieOptions);

    const mailOptions = { from: process.env.SENDER_EMAIL, to: email, subject: "Welcome to EngiVerse!", text: `Welcome aboard! Your account has been created with email id: ${email}` };
    await transporter.sendMail(mailOptions); 

    const userData = await userModel.findById(user._id).select("-password");
    return res.status(201).json({ success: true, message: "User registered successfully", user: userData });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- LOGIN CONTROLLER ---
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    const user = await userModel.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Account does not exist", code: "USER_NOT_FOUND" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 🔥 FIXED: Cookie Settings for Cross-Site (Vercel -> Render)
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Render (HTTPS) ke liye mandatory
        sameSite: 'none', // Vercel se Render connect karne ke liye mandatory
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("token", token, cookieOptions);
    
    const userData = await userModel.findById(user._id).select("-password");
    return res.status(200).json({ success: true, message: "Login successful", user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- LOGOUT CONTROLLER ---
export const logout = async (req, res) => {
  try {
    // 🔥 FIXED: Cookie clear karne ke liye bhi same options chahiye hote hain
    const cookieOptions = {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
    };
    
    res.clearCookie("token", cookieOptions);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- VERIFY OTP ---
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000; 
    await user.save();
    const mailOption = { from: process.env.SENDER_EMAIL, to: user.email, subject: "Account Verification OTP", html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email) };
    await transporter.sendMail(mailOption);
    return res.status(200).json({ success: true, message: "Verification OTP sent to your email" });
  } catch (error) {
    console.error("Send Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.json({ success: false, message: "OTP is missing" });

    const user = await userModel.findById(req.user.id).select('+verifyOtp +verifyOtpExpireAt');
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isAccountVerified) return res.json({ success: true, message: "Email already verified" });

    if (String(user.verifyOtp) !== String(otp)) return res.json({ success: false, message: "Invalid OTP" });

    if (user.verifyOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP has expired" });

    user.isAccountVerified = true;
    user.verifyOtp = ''; 
    user.verifyOtpExpireAt = 0; 
    
    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Verification Error:", error);
    return res.json({ success: false, message: "Server error during verification" });
  }
};

// --- IS AUTHENTICATED ---
export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    console.error("isAuthenticated Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- PASSWORD RESET ---
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found for this email" });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; 
    await user.save();
    const mailOption = { from: process.env.SENDER_EMAIL, to: user.email, subject: "Password Reset OTP", html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email) };
    await transporter.sendMail(mailOption);
    return res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send Reset OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
  try {
    const user = await userModel.findOne({ email }).select('+resetOtp +resetOtpExpireAt');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.resetOtp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.resetOtpExpireAt < Date.now()) return res.status(400).json({ success: false, message: "OTP has expired" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};