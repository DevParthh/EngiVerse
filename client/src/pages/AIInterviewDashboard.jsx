import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Squares from '../components/ui/Squares';
import Breadcrumbs from '../components/ui/Breadcrumbs'; 
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import InterviewHistoryCard from '../components/cards/InterviewHistoryCard';
import { toast } from 'react-toastify';
import { 
    Bot, History, TrendingUp, Trophy, Plus, X, Loader2, Sparkles, Calendar 
} from 'lucide-react';

// --- HELPER: Time Ago ---
const timeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hrs ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
};

// --- MODAL ---
const InterviewSelectionModal = ({ onClose, onStart }) => {
    const [voice, setVoice] = useState('female');
    const [isStarting, setIsStarting] = useState(false); 

    const handleStart = () => {
        setIsStarting(true);
        onStart({ voice });
    };

    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-2xl transform transition-all scale-100 animate-scaleIn relative overflow-hidden border border-white/20">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                <div className="text-center mb-6">
                    <div className="size-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><Bot size={28} /></div>
                    <h2 className="text-xl font-bold text-slate-800">Setup Interviewer</h2>
                    <p className="text-sm text-slate-500">Choose your AI interviewer's persona</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {['female', 'male'].map((v) => (
                        <label key={v} className={`cursor-pointer group relative rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-200 ${voice === v ? 'border-indigo-600 bg-indigo-50/50 shadow-sm scale-[1.02]' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                            <input type="radio" name="voice" value={v} checked={voice === v} onChange={() => setVoice(v)} className="sr-only" />
                            <div className={`size-10 rounded-full flex items-center justify-center text-xl transition-colors ${voice === v ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{v === 'female' ? '👩‍💼' : '👨‍💼'}</div>
                            <span className={`font-semibold capitalize text-sm ${voice === v ? 'text-indigo-700' : 'text-slate-600'}`}>{v}</span>
                            {voice === v && <div className="absolute top-2 right-2 size-2 bg-indigo-600 rounded-full"></div>}
                        </label>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleStart} disabled={isStarting} className="flex-[2] py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70">{isStarting && <Loader2 className="animate-spin size-4" />}{isStarting ? "Initializing..." : "Start Session"}</button>
                </div>
            </div>
        </div>
    );
};

// --- SKELETON ---
const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 h-48 animate-pulse flex flex-col justify-between">
                <div className="flex justify-between items-start"><div className="space-y-3 w-full"><div className="h-5 w-3/4 bg-slate-200 rounded"></div><div className="h-3 w-1/2 bg-slate-200 rounded"></div></div><div className="size-10 bg-slate-200 rounded-full shrink-0"></div></div><div className="space-y-2"><div className="h-2 w-full bg-slate-100 rounded"></div><div className="h-2 w-2/3 bg-slate-100 rounded"></div></div>
            </div>
        ))}
    </div>
);

// --- STAT CARD ---
const StatCard = ({ icon: Icon, label, value, subValue, gradient, textColor, progress }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className={`absolute -right-6 -top-6 size-24 rounded-full opacity-5 ${gradient}`}></div>
        <div className="flex items-center gap-4 relative z-10 mb-3">
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} ${textColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className="text-white" />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
            </div>
        </div>
        {progress !== undefined && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${gradient}`} style={{ width: `${progress}%` }}></div>
            </div>
        )}
        <p className="text-xs text-slate-400 mt-2 font-medium">{subValue}</p>
    </div>
);

const AIInterviewDashboard = () => {
    const { backendUrl, user } = useContext(AppContent);
    const navigate = useNavigate();
    
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/interviews/history`);
                if (response.data.success && isMounted) {
                    setHistory(response.data.data); 
                }
            } catch (error) {
                console.error("Fetch error", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchHistory();
        return () => { isMounted = false; };
    }, [backendUrl]);

    // --- 🔴 FIXED STATS CALCULATION LOGIC 🔴 ---
    const stats = useMemo(() => {
        if (!history || !Array.isArray(history) || history.length === 0) {
            return { total: 0, avgScore: 0, highestScore: 0, lastActive: null };
        }

        // Extract 'overallScore' specifically (based on your console data)
        const validScores = history
            .map(item => {
                // Priority: overallScore -> score -> totalScore
                let val = item.overallScore || item.score || item.totalScore;
                return Number(val) || 0; // Force convert to Number, default 0 if NaN
            })
            .filter(val => val > 0); // Only count non-zero scores if needed

        const total = history.length;
        const countWithScore = validScores.length; // Count sessions that actually have scores

        // Calculate Average
        let avgScore = 0;
        if (countWithScore > 0) {
            const totalScoreSum = validScores.reduce((a, b) => a + b, 0);
            avgScore = Math.round(totalScoreSum / countWithScore);
        }

        // Calculate Best
        const highestScore = countWithScore > 0 ? Math.max(...validScores) : 0;
        
        // Get Last Active Date
        const lastActive = history[0]?.createdAt || null;

        return { total, avgScore, highestScore, lastActive };
    }, [history]);

    const handleStartInterview = ({ voice }) => {
        setIsModalOpen(false);
        navigate('/practice-interviews', { state: { voice } });
    };

    const removeSessionFromState = (id) => {
        setHistory(prev => prev.filter(session => session._id !== id));
        toast.success("Session removed");
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <Squares direction="diagonal" speed={0.5} borderColor="#e2e8f0" hoverFillColor="#f1f5f9" />
            </div>

            <div className="relative z-10">
                <Navbar theme="light" />

                <div className="container mx-auto max-w-7xl pt-24 px-6 pb-12">
                    {isModalOpen && <InterviewSelectionModal onClose={() => setIsModalOpen(false)} onStart={handleStartInterview} />}
                    <div className="mb-6">
                        <Breadcrumbs items={[{ label: 'Interview Zone' }]} />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 font-medium mb-1 animate-fadeIn">
                                <Sparkles size={16} /> {greeting}, {user?.name?.split(' ')[0]}!
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                Interview Zone
                            </h1>
                            <p className="mt-2 text-slate-600 max-w-xl text-lg">
                                Ready to level up? Track your progress and master your skills.
                            </p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95">
                            <Plus size={20} /> Start New Interview
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <StatCard 
                            icon={History} 
                            label="Total Sessions" 
                            value={loading ? "-" : stats.total} 
                            subValue="Lifetime interviews"
                            gradient="from-blue-500 to-indigo-600" 
                            textColor="text-white"
                        />
                        <StatCard 
                            icon={TrendingUp} 
                            label="Average Score" 
                            value={loading ? "-" : `${stats.avgScore}%`} 
                            subValue="Consistency metric"
                            progress={stats.avgScore}
                            gradient="from-emerald-400 to-teal-500" 
                            textColor="text-white"
                        />
                        <StatCard 
                            icon={Trophy} 
                            label="Best Score" 
                            value={loading ? "-" : `${stats.highestScore}%`} 
                            subValue={stats.lastActive ? `Last active: ${timeAgo(stats.lastActive)}` : "No activity yet"}
                            progress={stats.highestScore}
                            gradient="from-amber-400 to-orange-500" 
                            textColor="text-white"
                        />
                    </div>

                    {/* History Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Recent Sessions</h2>
                            {!loading && history.length > 0 && <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">{history.length}</span>}
                        </div>
                        
                        {loading ? (
                            <DashboardSkeleton />
                        ) : history.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {history.map(session => (
                                    <InterviewHistoryCard 
                                        key={session._id} 
                                        session={session} 
                                        onDelete={removeSessionFromState} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                                <div className="bg-indigo-50 size-20 rounded-full flex items-center justify-center mx-auto mb-5"><Bot className="size-10 text-indigo-500" /></div>
                                <h3 className="text-xl font-bold text-slate-800">No interviews yet</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto mt-2">Your path to mastery begins here. Start your first AI mock interview and get instant feedback.</p>
                                <button onClick={() => setIsModalOpen(true)} className="text-white bg-indigo-600 px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2 mx-auto">Launch Interviewer <TrendingUp size={16}/></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInterviewDashboard;