import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import { getReceiverSocketId, io } from '../socket/socket.js'; // FIXED IMPORT

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        let conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'name profilePicture',
                match: { _id: { $ne: userId } }
            })
            .sort({ updatedAt: -1 });

        // Filter out valid conversations
        const validConversations = conversations.filter(convo => convo.participants.length > 0);

        res.status(200).json({ success: true, data: validConversations });
    } catch (error) {
        console.error("Error in getConversations:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Get messages between two users
// @route   GET /api/messages/:recipientId
export const getMessages = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Fetch non-deleted messages
        const messages = await Message.find({
            conversationId: conversation._id,
            deletedFor: { $ne: senderId }
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Send a message to a user
// @route   POST /api/messages/send/:recipientId
export const sendMessage = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const { text } = req.body;
        const senderId = req.user.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recipientId]
            });
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            type: 'text',
            content: text,
        });

        // Save DB Operations in Parallel
        await Promise.all([
            newMessage.save(),
            Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: {
                    text,
                    sender: senderId,
                }
            })
        ]);

        // --- SOCKET IO REAL-TIME ---
        const recipientSocketId = getReceiverSocketId(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error("Error in sendMessage: ", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Send an image or document
// @route   POST /api/messages/send-file/:recipientId
export const sendFile = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided." });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({ participants: [senderId, recipientId] });
        }

        const fileUrl = req.file.path; 
        const originalName = req.file.originalname;
        const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'document';

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            type: fileType,
            content: fileUrl,
            fileName: originalName
        });

        await Promise.all([
            newMessage.save(),
            Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: { text: fileType === 'image' ? 'Sent an image' : 'Sent a document', sender: senderId }
            })
        ]);
        
        // --- SOCKET IO REAL-TIME ---
        const recipientSocketId = getReceiverSocketId(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, data: newMessage });

    } catch (error) {
        console.error("Error in sendFile:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// @desc    Delete all messages in a conversation
// @route   DELETE /api/messages/clear/:conversationId
export const clearChat = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { mode } = req.body; // 'for_me' or 'for_everyone'
        const userId = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }

        if (mode === 'for_everyone') {
            await Message.deleteMany({ conversationId: conversationId });
        } else if (mode === 'for_me') {
            await Message.updateMany(
                { conversationId: conversationId },
                { $addToSet: { deletedFor: userId } }
            );
        } else {
            return res.status(400).json({ success: false, message: "Invalid delete mode." });
        }
        
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: { text: "Chat cleared." } });

        res.status(200).json({ success: true, message: "Chat history updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};


// @desc    Delete conversations (Multiple)
// @route   POST /api/messages/delete-conversations
export const deleteConversations = async (req, res) => {
    try {
        const { conversationIds } = req.body;
        const userId = req.user.id;

        if (!conversationIds || conversationIds.length === 0) {
            return res.status(400).json({ success: false, message: "No conversations selected." });
        }

        // Logic: Hum conversation document ko hi uda denge (Simplest implementation)
        // Ya agar 'WhatsApp style' chahiye (sirf mere liye delete), toh complex logic lagega.
        // Abhi ke liye hum 'Nuclear Option' use kar rahe hain: Delete from DB.
        
        // 1. Delete Messages linked to these conversations
        await Message.deleteMany({ conversationId: { $in: conversationIds } });

        // 2. Delete Conversations
        await Conversation.deleteMany({ 
            _id: { $in: conversationIds },
            participants: userId // Security check: User must be a participant
        });

        res.status(200).json({ success: true, message: "Conversations deleted successfully." });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};