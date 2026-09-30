import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";           // Security
import compression from "compression"; // Speed
import connectDB from "./config/mongodb.js";
import { app, server, io } from "./socket/socket.js";

// Models Import
import "./models/userModel.js";

// Route Imports
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import savedJobRouter from "./routes/savedJobRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import interviewRoutes from './routes/interviewRoutes.js';
import resumeRouter from './routes/resumeRoutes.js';
import marketplaceRouter from './routes/marketplaceRoutes.js';

// 👇 IMPORTANT: Port 5001 fix kiya hai 
const port = process.env.PORT || 5001; 

connectDB();

// Make io accessible
app.set("io", io);

// 👇 Best Practices Middleware (Security & Speed)
app.use(helmet()); 
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// 👇 Allowed Origins (Localhost + Tera Vercel App)
const allowedOrigins = [
  "http://localhost:5173",
  "https://engi-verse-yksa.vercel.app" // 🚨 FIX: Removed the trailing slash
];

// 👇 Dynamic CORS setup
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) OR localhost OR any Vercel domain
    if (!origin || origin.startsWith("http://localhost") || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// API Endpoints
app.get("/", (req, res) => {
  res.send("EngiVerse API is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter); 
app.use("/api/users", userRouter); 
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/saved-jobs", savedJobRouter);
app.use("/api/tasks", taskRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRouter);
app.use('/api/marketplace', marketplaceRouter);

// Start Server
server.listen(port, () =>
  console.log(`EngiVerse Server started on PORT:${port}`)
);

export default app;