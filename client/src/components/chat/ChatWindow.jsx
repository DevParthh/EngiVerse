import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AppContent } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Send, Paperclip, MoreVertical, ArrowLeft, Trash2, Download, FileText, AlertTriangle } from 'lucide-react';
import { formatMessageTime, formatLastSeen } from '../../utils/dateUtils';

// --- SPINNER COMPONENT ---
const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>;

// --- CLEAR CHAT MODAL (PREMIUM UI) ---
const ClearChatModal = ({ onClose, onConfirm, isClearing }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 transform scale-100 transition-all">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Clear Conversation?</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        This action cannot be undone. Choose how you want to clear this chat.
                    </p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => onConfirm('for_me')} 
                        disabled={isClearing}
                        className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                        {isClearing ? 'Processing...' : 'Clear for Me'}
                    </button>
                    
                    <button 
                        onClick={() => onConfirm('for_everyone')} 
                        disabled={isClearing}
                        className="w-full py-2.5 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md shadow-red-200 transition-all disabled:opacity-50"
                    >
                        {isClearing ? 'Processing...' : 'Clear for Everyone'}
                    </button>
                </div>

                <button 
                    onClick={onClose} 
                    disabled={isClearing}
                    className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

// --- MAIN CHAT WINDOW ---
const ChatWindow = ({ recipientId, conversationId, onBack }) => {
    const { backendUrl, user, socket } = useContext(AppContent);
    const [recipientProfile, setRecipientProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false); // Modal State
    const [isClearing, setIsClearing] = useState(false); // Processing State

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // 1. Fetch Chat Data
    const fetchChatData = useCallback(async () => {
        if (!recipientId) return;
        setLoading(true);
        try {
            const [profileRes, messagesRes] = await Promise.all([
                axios.get(`${backendUrl}/api/profile/${recipientId}`),
                axios.get(`${backendUrl}/api/messages/${recipientId}`)
            ]);
            if (profileRes.data.success) setRecipientProfile(profileRes.data.data);
            if (messagesRes.data.success) setMessages(messagesRes.data.data);
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to load chat.");
        } finally {
            setLoading(false); 
        }
    }, [recipientId, backendUrl]);

    useEffect(() => { fetchChatData(); }, [fetchChatData]);
    
    // 2. Socket Listeners (New Message & Clear Chat)
    useEffect(() => {
        if (socket) {
            // Handle incoming messages
            const handleNewMessage = (newMessage) => {
                if (newMessage.sender === recipientId || newMessage.sender === user._id) {
                    setMessages(prev => [...prev, newMessage]);
                }
            };

            // Handle "Clear Chat" event from the other user
            const handleChatCleared = (data) => {
                if (data.conversationId === conversationId) {
                    setMessages([]); // Clear locally instantly
                    toast.info("Chat history was cleared.");
                }
            };

            socket.on("newMessage", handleNewMessage);
            socket.on("chatCleared", handleChatCleared); // Listen for clear event

            return () => {
                socket.off("newMessage", handleNewMessage);
                socket.off("chatCleared", handleChatCleared);
            };
        }
    }, [socket, recipientId, user._id, conversationId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    // 3. Send Text
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        const tempMsg = { 
            _id: Date.now().toString(), 
            sender: user._id, 
            content: newMessage, 
            type: 'text', 
            createdAt: new Date().toISOString() 
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage("");

        try {
            await axios.post(`${backendUrl}/api/messages/send/${recipientId}`, { text: tempMsg.content });
        } catch (error) {
            toast.error("Message failed to send");
        }
    };

    // 4. Send File
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${backendUrl}/api/messages/send-file/${recipientId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success("File sent!");
            }
        } catch (error) {
            toast.error("File upload failed.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // 5. Handle Clear Chat (The Logic You Asked For)
    const handleClearChat = async (mode) => {
        if (!conversationId) {
            toast.error("No active conversation to clear.");
            return;
        }

        setIsClearing(true);
        try {
            // API Call: Pass the 'mode' ('for_me' or 'for_everyone')
            const response = await axios.put(`${backendUrl}/api/messages/clear/${conversationId}`, { mode });
            
            if (response.data.success) {
                setMessages([]); // Clear UI immediately
                toast.success(mode === 'for_everyone' ? "Deleted for everyone." : "Chat cleared for you.");
                
                // If cleared for everyone, emit socket event to update the other user
                if (mode === 'for_everyone' && socket) {
                    socket.emit('clearChat', { conversationId, recipientId });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to clear chat.");
        } finally {
            setIsClearing(false);
            setShowClearConfirm(false); // Close Modal
            setIsMenuOpen(false); // Close Menu
        }
    };

    // 6. Render Message Content
    const renderMessageContent = (msg) => {
        if (msg.type === 'image') {
            return (
                <img 
                    src={msg.content} 
                    alt="Shared" 
                    className="max-w-[200px] md:max-w-[280px] rounded-lg border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(msg.content, '_blank')}
                />
            );
        }
        if (msg.type === 'file' || msg.type === 'document') {
            return (
                <a 
                    href={msg.content} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        msg.sender === user._id 
                        ? 'bg-indigo-500 border-indigo-400 text-white hover:bg-indigo-400' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <div className={`p-2 rounded-full ${msg.sender === user._id ? 'bg-indigo-400' : 'bg-white'}`}>
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold truncate max-w-[140px] underline decoration-dotted">
                            Download File
                        </span>
                        <span className="text-[10px] opacity-80 uppercase">Attachment</span>
                    </div>
                    <Download className="w-4 h-4 ml-2 opacity-70" />
                </a>
            );
        }
        return <p className="leading-relaxed whitespace-pre-wrap pb-1">{msg.content}</p>;
    };

    if (loading) return <div className="flex-1 flex justify-center items-center h-full"><Spinner /></div>;
    
    return (
        <div className="flex flex-col h-full bg-[#eef2f6] relative">
            
            {/* Modal Overlay */}
            {showClearConfirm && (
                <ClearChatModal 
                    onClose={() => setShowClearConfirm(false)} 
                    onConfirm={handleClearChat} 
                    isClearing={isClearing} 
                />
            )}

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link to={`/profile/${recipientProfile?._id}`} className="flex items-center gap-3 group">
                        <div className="relative">
                            <img 
                                src={recipientProfile?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${recipientProfile?.name}`} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover border border-slate-100"
                            />
                            {formatLastSeen(recipientProfile?.updatedAt) === 'Online' && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                {recipientProfile?.name}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {recipientProfile ? formatLastSeen(recipientProfile.updatedAt) : 'Offline'}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Options Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                            <button 
                                onClick={() => setShowClearConfirm(true)} 
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Clear Chat History
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MESSAGES AREA --- */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-2">👋</div>
                        <p className="text-sm text-slate-500">Say hello to {recipientProfile?.name}!</p>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMe = msg.sender === user._id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            }`}>
                                {renderMessageContent(msg)}
                                <span className={`text-[9px] block text-right font-medium opacity-70 mt-1 ${isMe ? 'text-indigo-100' : 'text-slate-400'}`}>
                                    {formatMessageTime(msg.createdAt)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {isUploading && (
                    <div className="flex justify-end">
                        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-bold animate-pulse">
                            Uploading file...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* --- INPUT AREA --- */}
            <div className="p-3 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-50"
                        title="Attach File"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type a message..." 
                        className="flex-1 py-2.5 px-4 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm transition-all outline-none"
                    />
                    
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() && !isUploading} 
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;