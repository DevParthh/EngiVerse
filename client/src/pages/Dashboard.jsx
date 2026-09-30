import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Squares from "../components/ui/Squares"; 
import { AppContent } from "../context/AppContext";
import { 
    Briefcase, 
    Users, 
    Mic, 
    FileText, 
    Zap, 
    ArrowRight, 
    Target, 
    Calendar,
    Sparkles,
    Layout,
    CheckCircle2,
    PenTool, 
    ShoppingCart // <-- New Icon for EngiMart
} from "lucide-react";

// ... (Helper & StatCard components same as before) ...
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-between group">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                {value}
            </h3>
        </div>
        <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
    </div>
);

// --- COMPONENT: Premium Tool Card ---
const ToolCard = ({ to, title, desc, icon: Icon, buttonText, theme }) => {
    const themes = {
        indigo: "hover:bg-indigo-600 hover:border-indigo-600",
        emerald: "hover:bg-emerald-600 hover:border-emerald-600",
        violet: "hover:bg-violet-600 hover:border-violet-600",
        blue: "hover:bg-blue-600 hover:border-blue-600",
        rose: "hover:bg-rose-600 hover:border-rose-600", 
        amber: "hover:bg-amber-500 hover:border-amber-500", // <-- New Theme for EngiMart
    };

    const iconThemes = {
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-white/20 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-white/20 group-hover:text-white",
        violet: "bg-violet-50 text-violet-600 group-hover:bg-white/20 group-hover:text-white",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-white/20 group-hover:text-white",
        rose: "bg-rose-50 text-rose-600 group-hover:bg-white/20 group-hover:text-white",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-white/20 group-hover:text-white", // <-- New Icon Theme
    };

    return (
        <Link 
            to={to} 
            className={`group relative flex flex-col justify-between h-full p-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.1)] transition-all duration-300 ${themes[theme] || themes.indigo}`}
        >
            <div>
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl transition-colors duration-300 ${iconThemes[theme] || iconThemes.indigo}`}>
                        <Icon className="w-8 h-8" strokeWidth={2} />
                    </div>
                    
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-white/20 text-white">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors mb-3">
                    {title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-white/90 transition-colors">
                    {desc}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 group-hover:border-white/20 transition-colors">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-white/80 transition-colors flex items-center gap-2">
                    {buttonText}
                </span>
            </div>
        </Link>
    );
};

const Dashboard = () => {
    const { backendUrl, user } = useContext(AppContent);
    const [loading, setLoading] = useState(true);
    const [profileScore, setProfileScore] = useState(0);

    useEffect(() => {
        if (user) {
            let score = 0;
            if (user.name) score += 20;
            if (user.profilePicture) score += 20;
            if (user.skills && user.skills.length > 0) score += 20;
            if (user.bio) score += 10;
            if (user.collegeName) score += 20;
            if (user.socialLinks?.github || user.socialLinks?.linkedIn) score += 10;
            setProfileScore(Math.min(score, 100));
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const firstName = user?.name?.split(' ')[0] || 'Engineer';
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative selection:bg-indigo-100 selection:text-indigo-900">
            
            {/* --- Background --- */}
            <div className="fixed inset-0 z-0 opacity-60">
                <Squares 
                    speed={0.2} 
                    squareSize={40}
                    direction='diagonal' 
                    borderColor='#e2e8f0'
                    hoverFillColor='#e0e7ff'
                />
            </div>

            <Navbar theme="transparent" />
            
            <div className="container mx-auto max-w-7xl pt-28 px-6 lg:px-8 relative z-10 pb-20">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span>{currentDate}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            {getGreeting()}, <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                {firstName}.
                            </span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-slate-200 shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-sm font-bold text-slate-700">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- METRICS ROW --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <StatCard 
                        icon={Target} 
                        value={`${profileScore}%`} 
                        label="Profile Health"
                        color={profileScore === 100 ? "emerald" : "indigo"}
                    />
                    <StatCard 
                        icon={Users} 
                        value={user?.friends?.length || 0} 
                        label="Your Network"
                        color="blue"
                    />
                    <StatCard 
                        icon={Zap} 
                        value={user?.engiCoins || 0} 
                        label="EngiCoins"
                        color="yellow"
                    />
                </div>

                {/* --- MAIN TOOLS GRID --- */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-slate-900 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                            <Layout className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Workspace</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Resume Builder */}
                        <ToolCard 
                            to="/resume-dashboard"
                            icon={FileText}
                            title="AI Resume Studio"
                            desc="Construct a high-impact, ATS-optimized resume tailored for top engineering roles using Gemini AI."
                            buttonText="Create New Resume"
                            theme="indigo"
                        />

                        {/* 2. Mock Interview */}
                        <ToolCard 
                            to="/ai-interviewer"
                            icon={Mic}
                            title="Mock Interviewer"
                            desc="Simulate real technical interviews. Get instant AI feedback on your answers, tone, and confidence."
                            buttonText="Start Simulation"
                            theme="emerald"
                        />

                        {/* 3. EngiBoard */}
                        <ToolCard 
                            to="/whiteboard"
                            icon={PenTool}
                            title="EngiBoard"
                            desc="Real-time collaborative whiteboard for System Design. Draw architectures and invite friends instantly."
                            buttonText="Launch Whiteboard"
                            theme="rose"
                        />

                        {/* 4. Jobs */}
                        <ToolCard 
                            to="/jobs"
                            icon={Briefcase}
                            title="Job Portal"
                            desc="Access curated internship and full-time opportunities matched to your specific skill set."
                            buttonText="Browse Openings"
                            theme="violet"
                        />

                        {/* 5. Skill Exchange */}
                        <ToolCard 
                            to="/community/skill-exchange"
                            icon={Zap}
                            title="Skill Exchange"
                            desc="Collaborate with peers on projects, solve doubts, and earn EngiCoins for your contributions."
                            buttonText="Enter Community"
                            theme="blue"
                        />

                        {/* 6. EngiMart (NEW PREMIUM FEATURE) */}
                        <ToolCard 
                            to="/engimart" // Ensure route exists
                            icon={ShoppingCart}
                            title="EngiMart"
                            desc="Buy & Sell premium engineering notes, projects, and resources using your earned EngiCoins."
                            buttonText="Visit Marketplace"
                            theme="amber"
                        />

                    </div>
                </div>

                {/* --- BOTTOM PROMO --- */}
                <div className="mt-12 text-center pb-8">
                    <p className="text-sm text-slate-500 font-medium">
                        Looking for more? <Link to="/community/explore" className="text-indigo-600 font-bold hover:underline">Explore the Community</Link> to grow your network.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;