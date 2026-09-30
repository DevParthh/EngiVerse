import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Trophy, Compass, Users, MessageSquare } from 'lucide-react';

const CommunitySidenav = () => {
    
    const navItems = [
        { to: "/community/skill-exchange", icon: Zap, label: "Skill Exchange" },
        { to: "/community/leaderboard", icon: Trophy, label: "Leaderboard" },
        { to: "/community/explore", icon: Compass, label: "Explore" },
        { to: "/community/friends", icon: Users, label: "Friends" },
        { to: "/community/messages", icon: MessageSquare, label: "Messages" },
    ];

    return (
        <div className="h-full flex flex-col justify-between py-6 px-4 overflow-y-auto">
            
            {/* Navigation Links */}
            <div className="space-y-1">
                <div className="px-3 mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Menu
                    </span>
                </div>

                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
                            group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActive 
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon 
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                                    strokeWidth={2} 
                                />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

  
            </div>
    );
};

export default CommunitySidenav;