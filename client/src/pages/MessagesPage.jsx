import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { MessageSquare, Home, ChevronRight, Edit2, Trash2, X } from 'lucide-react';

const MessagesPage = () => {
    const { backendUrl } = useContext(AppContent);
    let { recipientId } = useParams();
    const navigate = useNavigate();

    if (recipientId === 'undefined') recipientId = undefined;

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedConversations, setSelectedConversations] = useState([]);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/messages/conversations`);
            if (response.data.success) {
                setConversations(response.data.data);
            }
        } catch (error) {
            console.error("Load error", error);
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    useEffect(() => {
        setLoading(true);
        fetchConversations();
    }, [fetchConversations]);

    const currentConversation = conversations.find(c => c.participants[0]?._id === recipientId);
    const conversationId = currentConversation?._id;

    // --- Handlers ---
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedConversations([]);
    };

    const handleSelect = (convoId) => {
        if (selectedConversations.includes(convoId)) {
            setSelectedConversations(prev => prev.filter(id => id !== convoId));
        } else {
            setSelectedConversations(prev => [...prev, convoId]);
        }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedConversations.length} conversations permanently?`)) return;
        
        try {
            const response = await axios.post(
                `${backendUrl}/api/messages/delete-conversations`,
                { conversationIds: selectedConversations },
                { withCredentials: true }
            );

            if (response.data.success) {
                setConversations(prev => prev.filter(c => !selectedConversations.includes(c._id)));
                setIsSelectionMode(false);
                setSelectedConversations([]);
                toast.success("Conversations deleted.");
                
                if (recipientId && selectedConversations.includes(conversationId)) {
                    navigate('/community/messages');
                }
            }
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete conversations.");
        }
    };

    return (
        // Consistent Container with Friends/Explore pages
        <div className="w-full max-w-7xl mx-auto pt-1 px-4 sm:px-6 lg:px-8 pb-12 h-screen flex flex-col animate-in fade-in duration-500">
            
            {/* Header / Breadcrumbs */}
            <div className="mb-4 shrink-0">
                <nav className="flex items-center text-sm text-slate-500 mb-2">
                    <Link to="/dashboard" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        <Home size={14} /> Dashboard
                    </Link>
                    <ChevronRight size={14} className="mx-2 text-slate-300" />
                    <span className="font-semibold text-slate-800">Messages</span>
                </nav>
            </div>

            {/* Main Chat Layout Card */}
            <div className="flex-1 flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
                
                {/* --- LEFT: SIDEBAR --- */}
                <aside className={`w-full md:w-[340px] lg:w-[380px] border-r border-slate-100 flex flex-col bg-white ${recipientId ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Sidebar Header */}
                    <div className="shrink-0 h-16 px-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        {isSelectionMode ? (
                            <div className="flex items-center gap-3 w-full animate-in slide-in-from-top-2 duration-200">
                                <button onClick={toggleSelectionMode} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                                <span className="text-sm font-bold text-slate-800">{selectedConversations.length} Selected</span>
                                <div className="flex-1"></div>
                                {selectedConversations.length > 0 && (
                                    <button onClick={handleDeleteSelected} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" title="Delete Selected">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Chats</h1>
                                <button 
                                    onClick={toggleSelectionMode}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                    title="Manage Chats"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-hidden">
                        <ConversationList 
                            conversations={conversations} 
                            loading={loading} 
                            isSelectionMode={isSelectionMode}
                            selectedIds={selectedConversations}
                            onSelect={handleSelect}
                        />
                    </div>
                </aside>

                {/* --- RIGHT: CHAT WINDOW --- */}
                <main className={`flex-1 flex flex-col relative bg-[#F9FAFB] ${!recipientId ? 'hidden md:flex' : 'flex'}`}>
                    {recipientId ? (
                        <ChatWindow 
                            key={recipientId}
                            recipientId={recipientId} 
                            conversationId={conversationId}
                            onBack={() => navigate('/community/messages')} 
                        />
                    ) : (
                        // Empty State
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-slate-50/50">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5 border border-indigo-100 animate-in zoom-in duration-300">
                                <MessageSquare className="w-9 h-9 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Your Messages</h2>
                            <p className="mt-2 text-slate-500 max-w-xs text-sm">
                                Select a conversation from the sidebar to start chatting with your community.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MessagesPage;