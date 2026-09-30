import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap, ArrowUpRight } from 'lucide-react';

const TaskCard = ({ task }) => {
    if (!task) return null;

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    
    // 🔥 Added Missing Minutes Logic
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";

    return "Just now"; // For less than 1 minute (seconds)
};

    // Premium Status Colors
    const getStatusStyles = (status) => {
        switch(status) {
            case 'completed': return 'from-emerald-500 to-teal-500';
            case 'in_progress': return 'from-blue-500 to-indigo-500';
            default: return 'from-amber-400 to-orange-500'; // Open
        }
    };

    return (
        <Link 
            to={`/community/tasks/${task._id}`} 
            className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            {/* Top Color Strip (Visual Status) */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusStyles(task.status)}`} />

            <div className="p-6 flex flex-col h-full">
                
                {/* 1. Header: Title & Bounty */}
                <div className="flex justify-between items-start gap-3 mb-3">
                    {/* Title: Line clamp 2 to show more text */}
                    <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {task.title}
                    </h3>
                    
                    {/* Floating Arrow Icon (Appears on Hover) */}
                    <ArrowUpRight className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-indigo-600 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                </div>

                {/* 2. Metadata: Bounty & User */}
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <img 
                            src={task.user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${task.user?.name || 'User'}`} 
                            alt="User" 
                            className="w-6 h-6 rounded-full border border-slate-100"
                        />
                        <span className="text-xs font-medium text-slate-500 truncate max-w-[100px]">
                            {task.user?.name}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{timeAgo(task.createdAt)}</span>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Zap className="w-3 h-3 fill-current" />
                        {task.bounty}
                    </div>
                </div>

                {/* 3. Description (Takes remaining space) */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5 flex-grow">
                    {task.description}
                </p>

                {/* 4. Footer: Skills */}
                <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex flex-wrap gap-2">
                        {task.skills?.slice(0, 3).map((skill, idx) => (
                            <span 
                                key={idx} 
                                className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md"
                            >
                                {skill}
                            </span>
                        ))}
                        {task.skills?.length > 3 && (
                            <span className="px-2 py-1 text-[11px] font-medium text-slate-400 bg-slate-50 rounded-md">
                                +{task.skills.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TaskCard;