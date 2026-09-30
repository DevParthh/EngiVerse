import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Trophy, Medal, Award, Zap, Coins, TrendingUp, Users } from 'lucide-react';

// --- PROFESSIONAL PODIUM COMPONENT ---
const PodiumItem = ({ user, rank, type }) => {
    if (!user) return null;

    const isHelper = type === 'helpers';
    
    // Professional Rank Styles
    const rankStyles = {
        1: { 
            height: 'h-64', 
            width: 'w-48',
            borderColor: 'border-yellow-400',
            bgColor: 'bg-gradient-to-b from-yellow-50 to-white',
            badgeBg: 'bg-yellow-100 text-yellow-700',
            icon: <Trophy className="w-6 h-6 text-yellow-600" />,
            label: '1st Place'
        },
        2: { 
            height: 'h-52', 
            width: 'w-40',
            borderColor: 'border-slate-300',
            bgColor: 'bg-gradient-to-b from-slate-50 to-white',
            badgeBg: 'bg-slate-100 text-slate-700',
            icon: <Medal className="w-5 h-5 text-slate-500" />,
            label: '2nd Place',
            marginTop: 'mt-12'
        },
        3: { 
            height: 'h-48', 
            width: 'w-40',
            borderColor: 'border-orange-300',
            bgColor: 'bg-gradient-to-b from-orange-50 to-white',
            badgeBg: 'bg-orange-100 text-orange-700',
            icon: <Medal className="w-5 h-5 text-orange-600" />,
            label: '3rd Place',
            marginTop: 'mt-16'
        }
    };

    const style = rankStyles[rank];

    return (
        <div className={`flex flex-col items-center ${style.marginTop}`}>
            
            {/* User Avatar */}
            <div className="relative mb-4">
                <img 
                    src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                    alt={user.name} 
                    className={`w-20 h-20 rounded-full object-cover border-4 ${style.borderColor} shadow-sm`}
                />
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold border border-white shadow-sm whitespace-nowrap ${style.badgeBg}`}>
                    {style.label}
                </div>
            </div>

            {/* Podium Card */}
            <Link to={`/profile/${user._id}`} className={`
                ${style.width} ${style.height} 
                ${style.bgColor} 
                border-t border-x ${style.borderColor} rounded-t-xl
                flex flex-col items-center pt-6 px-4
                hover:bg-white transition-colors duration-300
                shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]
            `}>
                <h3 className="font-bold text-slate-800 text-base text-center line-clamp-1 w-full">
                    {user.name}
                </h3>
                
                <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        {isHelper ? 'Tasks Done' : 'Net Worth'}
                    </span>
                    <span className={`text-xl font-bold flex items-center gap-1.5 ${isHelper ? 'text-indigo-600' : 'text-emerald-600'}`}>
                        {isHelper ? <Zap className="w-4 h-4 fill-current" /> : <Coins className="w-4 h-4 fill-current" />}
                        {isHelper ? user.tasksCompleted : user.engiCoins}
                    </span>
                </div>
            </Link>
        </div>
    );
};

// --- CLEAN LIST ROW (Rank 4+) ---
const ListRow = ({ user, rank, type }) => (
    <Link 
        to={`/profile/${user._id}`} 
        className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all duration-200 group"
    >
        <span className="font-bold text-slate-400 w-8 text-center text-sm">#{rank}</span>
        
        <img 
            src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200" 
        />
        
        <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                {user.name}
            </h4>
            <p className="text-xs text-slate-500">
                {user.collegeName || 'Community Member'}
            </p>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
            type === 'helpers' 
            ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
            {type === 'helpers' ? <Zap className="w-3.5 h-3.5" /> : <Coins className="w-3.5 h-3.5" />}
            <span>{type === 'helpers' ? user.tasksCompleted : user.engiCoins}</span>
        </div>
    </Link>
);

const Leaderboard = () => {
    const { backendUrl } = useContext(AppContent);
    const [topHelpers, setTopHelpers] = useState([]);
    const [wealthiestUsers, setWealthiestUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('helpers');

    useEffect(() => {
        setLoading(true);
        axios.get(`${backendUrl}/api/leaderboard`)
            .then(res => {
                if (res.data.success) {
                    setTopHelpers(res.data.data.topHelpers || []);
                    setWealthiestUsers(res.data.data.wealthiestUsers || []);
                }
            })
            .catch((err) => {
                toast.error("Could not sync leaderboard.");
            })
            .finally(() => setLoading(false));
    }, [backendUrl]);

    const currentList = activeTab === 'helpers' ? topHelpers : wealthiestUsers;
    const topThree = [currentList[1], currentList[0], currentList[2]];
    const restList = currentList.slice(3);

    return (
        <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="mb-8">
                <Breadcrumbs />
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mt-4 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Leaderboard
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Recognizing top contributors across the community.
                        </p>
                    </div>

                    {/* Clean Tabs */}
                    <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                        <button 
                            onClick={() => setActiveTab('helpers')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                                activeTab === 'helpers' 
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Award className="w-4 h-4" /> All-Time Helpers
                        </button>
                        <button 
                            onClick={() => setActiveTab('wealth')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                                activeTab === 'wealth' 
                                ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" /> Top Earners
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : currentList.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">No data available yet.</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium Area */}
                    <div className="mb-10 flex justify-center items-end gap-4 md:gap-8 border-b border-slate-100 pb-0">
                        <PodiumItem user={topThree[0]} rank={2} type={activeTab} />
                        <PodiumItem user={topThree[1]} rank={1} type={activeTab} />
                        <PodiumItem user={topThree[2]} rank={3} type={activeTab} />
                    </div>

                    {/* Remaining List */}
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Users className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Runner Ups
                            </h3>
                        </div>
                        
                        <div className="space-y-3">
                            {restList.length > 0 ? (
                                restList.map((user, idx) => (
                                    <ListRow key={user._id} user={user} rank={idx + 4} type={activeTab} />
                                ))
                            ) : (
                                <p className="text-center py-6 text-slate-400 text-sm italic">
                                    No more users to display.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;