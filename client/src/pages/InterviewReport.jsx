import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import Navbar from '../components/ui/Navbar';
import Squares from '../components/ui/Squares';
import { 
    Download, ChevronRight, Home, Calendar, Clock, 
    CheckCircle2, AlertCircle, MessageSquare, BarChart3, Layers 
} from 'lucide-react';

// --- Sub-components ---

const ScoreGauge = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    const getColor = (s) => {
        if (s >= 80) return "text-emerald-500";
        if (s >= 50) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle 
                    cx="60" cy="60" r={radius} 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round"
                    className={`${getColor(score)} transition-all duration-1000 ease-out`}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold ${getColor(score)}`}>{score}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Overall</span>
            </div>
        </div>
    );
};

const FeedbackCard = ({ title, content, type }) => {
    const isStrength = type === 'strength';
    const items = content?.split('\n').filter(i => i.trim() !== '') || [];

    return (
        <div className={`h-full p-6 rounded-2xl border ${isStrength ? 'bg-emerald-50/50 border-emerald-100' : 'bg-orange-50/50 border-orange-100'}`}>
            <div className="flex items-center gap-2 mb-4">
                {isStrength ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
                <h3 className={`font-bold text-lg ${isStrength ? 'text-emerald-900' : 'text-orange-900'}`}>{title}</h3>
            </div>
            <ul className="space-y-3">
                {items.length > 0 ? items.map((item, idx) => (
                    <li key={idx} className={`text-sm leading-relaxed flex items-start gap-2 ${isStrength ? 'text-emerald-800' : 'text-orange-800'}`}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        {item.replace(/^- /, '')}
                    </li>
                )) : <p className="text-gray-500 italic">No specific data available.</p>}
            </ul>
        </div>
    );
};

// --- Main Component ---

const InterviewReport = () => {
    const { sessionId } = useParams();
    const { backendUrl } = useContext(AppContent);
    const [session, setSession] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analysis'); 
    const navigate = useNavigate();

    // ERROR FIX: Use Native Print instead of library to avoid "nothing to print" error
    const handleNativePrint = () => {
        window.print();
    };

    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) return;
            try {
                const response = await axios.get(`${backendUrl}/api/interviews/${sessionId}`);
                if (response.data.success) {
                    const sessionData = response.data.data;
                    setSession(sessionData);
                    if (sessionData.finalReport) {
                        try {
                            const parsed = JSON.parse(sessionData.finalReport);
                            parsed.overallScore = sessionData.overallScore;
                            setReport(parsed);
                        } catch (e) { console.error("Parse Error", e); }
                    }
                }
            } catch (error) {
                console.error("Fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [backendUrl, sessionId]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!session) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-gray-800">Report Not Found</h2>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 hover:underline">Return to Dashboard</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans text-slate-800">
             
             {/* Print Styles: Forces proper printing */}
            <style>{`
                @media print {
                    @page { margin: 15px; size: auto; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-hidden { display: none !important; }
                    .print-full { width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important; }
                    .print-clean { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                }
            `}</style>

             {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none print-hidden"><Squares /></div>
            
            <div className="print-hidden">
                <Navbar theme="transparent" />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-12 print-full">
                
                {/* 1. UPDATED BREADCRUMBS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print-hidden">
                    <nav className="flex items-center text-sm text-gray-500 font-medium">
                        {/* Link 1: Main Dashboard */}
                        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <Home className="w-4 h-4" /> 
                            <span>Dashboard</span>
                        </Link>
                        
                        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />

                        <Link to="/ai-interviewer" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <Layers className="w-4 h-4" />
                            <span>Interview Zone</span>
                        </Link>

                        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                        
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Report Analysis</span>
                    </nav>

                    <button 
                        onClick={handleNativePrint}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>

                {/* 2. Main Report Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden print-clean">
                    
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Interview Performance Report</h1>
                                <div className="flex flex-wrap gap-4 text-indigo-100 text-sm">
                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(session.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4" />
                                        {new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Completed
                                    </div>
                                </div>
                            </div>
                            
                            {/* Score Overview */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 pr-8 flex items-center gap-6 border border-white/20">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">Score</p>
                                    <p className="text-sm text-indigo-100 mt-1">AI Evaluated</p>
                                </div>
                                <div className="bg-white text-indigo-900 font-bold text-3xl w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                                    {report?.overallScore || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Navigation Tabs */}
                    <div className="flex border-b border-gray-100 px-8 print-hidden">
                        <button 
                            onClick={() => setActiveTab('analysis')}
                            className={`flex items-center gap-2 py-4 px-2 mr-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <BarChart3 className="w-4 h-4" /> Detailed Analysis
                        </button>
                        <button 
                            onClick={() => setActiveTab('transcript')}
                            className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'transcript' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Transcript History
                        </button>
                    </div>

                    {/* 4. Tab Content */}
                    <div className="p-8 bg-white min-h-[500px]">
                        
                        {(activeTab === 'analysis' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">Executive Summary</h3>
                                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-gray-700 leading-relaxed text-lg text-justify">
                                            {report?.summary || "No summary available."}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 p-6 print:border-none">
                                        <ScoreGauge score={report?.overallScore || 0} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                                    <FeedbackCard title="Key Strengths" content={report?.strengths} type="strength" />
                                    <FeedbackCard title="Areas for Improvement" content={report?.areasForImprovement} type="weakness" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'transcript' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-6 max-w-3xl mx-auto">
                                    {session.conversationHistory.map((msg, index) => (
                                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} break-inside-avoid`}>
                                            <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none border-indigo-500' : 'bg-white text-gray-800 rounded-bl-none border-gray-200'}`}>
                                                <p className="text-xs font-bold mb-2 opacity-80 uppercase tracking-wider flex items-center gap-2">
                                                    {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                                                </p>
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewReport;