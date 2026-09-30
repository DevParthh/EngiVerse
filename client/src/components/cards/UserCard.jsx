import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check, MessageSquare, MapPin, GraduationCap } from 'lucide-react';

const UserCard = ({ user, onConnect }) => {
    const isRequested = user.friendshipStatus === 'request_sent_by_me' || user.friendshipStatus === 'pending';
    const isReceived = user.friendshipStatus === 'request_received';
    const isFriend = user.friendshipStatus === 'friends';

    return (
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 h-full">
            
            {/* Top Accent Line (Subtle Premium Touch) */}
            <div className="h-1.5 w-full bg-indigo-500 rounded-t-xl"></div>

            <div className="p-5 flex flex-col flex-1 items-center text-center">
                
                {/* Avatar */}
                <Link to={`/profile/${user._id}`} className="relative -mt-10 mb-3 group">
                    <img 
                        src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                        alt={user.name} 
                        className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-slate-50 group-hover:scale-105 transition-transform"
                    />
                </Link>

                {/* Name & Headline */}
                <Link to={`/profile/${user._id}`} className="block w-full">
                    <h3 className="text-base font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                        {user.name}
                    </h3>
                </Link>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 w-full px-2 h-4">
                    {user.headline || "Engineering Student"}
                </p>

                {/* College Info */}
                <div className="flex items-center justify-center gap-1.5 mt-3 w-full">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 truncate max-w-[180px]">
                        {user.collegeName || "EngiVerse University"}
                    </span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-100 my-4"></div>

                {/* Skills (Clean Tags) */}
                <div className="flex flex-wrap justify-center gap-1.5 w-full mb-4 h-12 overflow-hidden content-start">
                    {user.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold rounded-md uppercase tracking-wide">
                            {skill}
                        </span>
                    ))}
                    {user.skills?.length > 3 && (
                        <span className="px-2 py-1 text-[10px] text-slate-400 font-medium">
                            +{user.skills.length - 3}
                        </span>
                    )}
                </div>

                <div className="flex-grow"></div>

                {/* Action Button (Full Width) */}
                <div className="w-full mt-auto">
                    {isFriend ? (
                        <Link to={`/community/messages/${user._id}`} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all">
                            <MessageSquare className="w-4 h-4" /> Message
                        </Link>
                    ) : isRequested ? (
                        <button disabled className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-semibold cursor-not-allowed">
                            <Check className="w-4 h-4" /> Sent
                        </button>
                    ) : isReceived ? (
                        <Link to="/community/friends" className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all">
                            Respond
                        </Link>
                    ) : (
                        <button 
                            onClick={() => onConnect(user._id)}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 active:translate-y-0.5 transition-all"
                        >
                            <UserPlus className="w-4 h-4" /> Connect
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCard;