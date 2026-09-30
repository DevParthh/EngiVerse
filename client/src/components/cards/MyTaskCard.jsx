import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, User, ArrowRight, AlertCircle } from 'lucide-react';

const MyTaskCard = ({ task, role }) => {
    if (!task) return null;

    const otherUser = role === 'owner' ? task.assignedTo : task.user;

    // Premium Status Styling
    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-200'; // Open
        }
    };

    const formatStatus = (status) => status.replace('_', ' ');

    return (
        <Link 
            to={`/community/tasks/${task._id}`} 
            className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 ease-out h-full"
        >
            {/* Top Row: Role & Status */}
            <div className="flex justify-between items-center mb-3">
                {/* Role Badge */}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                    role === 'owner' 
                    ? 'bg-slate-100 text-slate-600 border-slate-200' 
                    : 'bg-purple-50 text-purple-600 border-purple-100'
                }`}>
                    {role === 'owner' ? 'My Post' : 'Working On'}
                </span>

                {/* Status Badge */}
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                    {formatStatus(task.status)}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {task.title}
            </h3>

            {/* Middle Section: Who am I dealing with? */}
            <div className="flex-grow">
                <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {otherUser ? (
                        <>
                            <img 
                                src={otherUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.name}`} 
                                alt="User" 
                                className="w-8 h-8 rounded-full border border-white shadow-sm" 
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                    {role === 'owner' ? 'Assigned To' : 'Posted By'}
                                </span>
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                                    {otherUser.name}
                                </span>
                            </div>
                        </>
                    ) : (
                        // Case: Owner posted but hasn't assigned anyone yet
                        <>
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                                <span className="text-xs font-bold text-slate-500">Awaiting Offers</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer: Bounty & Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                
                <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 text-sm">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{task.bounty}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                    View Details 
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
};

export default MyTaskCard;