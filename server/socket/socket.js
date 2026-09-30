import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "https://engiverse-chi.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true
    },
});

// Map to store { userId: socketId }
const userSocketMap = {}; 

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: ${userId}`); // Debug log
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("sendMessage", ({ recipientId, message }) => {
        const recipientSocketId = getReceiverSocketId(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", message);
        }
    });

    socket.on("disconnect", () => {
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { app, io, server };