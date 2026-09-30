import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils'; 

const ConversationList = ({ 
    conversations, 
    loading, 
    isSelectionMode = false, 
    selectedIds = [], 
    onSelect 
}) => {
    const { recipientId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-indigo-100 border-t-indigo-600"></div>
        </div>
    );

    const filteredConvos = conversations.filter(c => 
        c.participants[0]?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white">
            
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 sticky top-0 bg-white z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search messages..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConvos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                        <p>No conversations found.</p>
                    </div>
                ) : (
                    <ul>
                        {filteredConvos.map(convo => {
                            const otherUser = convo.participants[0];
                            if (!otherUser) return null;

                            const isActive = otherUser._id === recipientId;
                            const isSelected = selectedIds.includes(convo._id);
                            const lastMsgTime = convo.lastMessage ? formatRelativeTime(convo.lastMessage.createdAt) : '';

                            // Common Content Component
                            const Content = () => (
                                <>
                                    <div className="relative shrink-0">
                                        <img
                                            src={otherUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.name}`}
                                            alt={otherUser.name}
                                            className={`w-12 h-12 rounded-full object-cover border transition-all ${
                                                isSelectionMode && isSelected 
                                                    ? 'border-indigo-200 scale-95' 
                                                    : 'border-slate-200'
                                            }`}
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`text-sm font-bold truncate ${isActive || isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                {otherUser.name}
                                            </h3>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                                {lastMsgTime}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${isActive || isSelected ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                                            {convo.lastMessage?.sender === otherUser._id ? '' : 'You: '} 
                                            {convo.lastMessage?.text || "Started a conversation"}
                                        </p>
                                    </div>
                                </>
                            );

                            return (
                                <li key={convo._id}>
                                    {isSelectionMode ? (
                                        // --- SELECTION MODE (Div with Checkbox) ---
                                        <div
                                            onClick={() => onSelect(convo._id)}
                                            className={`flex items-center gap-3 p-3 border-b border-slate-50 cursor-pointer transition-all duration-200 ${
                                                isSelected ? 'bg-indigo-50/60 border-indigo-100' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            {/* Checkbox UI */}
                                            <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                                                isSelected 
                                                    ? 'bg-indigo-600 border-indigo-600 scale-110' 
                                                    : 'border-slate-300 bg-white hover:border-indigo-400'
                                            }`}>
                                                {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
                                            </div>
                                            
                                            <Content />
                                        </div>
                                    ) : (
                                        // --- NORMAL MODE (Link) ---
                                        <Link
                                            to={`/community/messages/${otherUser._id}`}
                                            className={`flex items-center gap-3 p-3 border-b border-slate-50 hover:bg-slate-50 transition-all duration-200 active:scale-[0.99] ${
                                                isActive ? 'bg-indigo-50 border-indigo-100 shadow-inner' : ''
                                            }`}
                                        >
                                            <Content />
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConversationList;