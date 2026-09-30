import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    Mic, StopCircle, Send, LogOut, ChevronRight, Home, 
    AlertTriangle, CheckCircle, FileText, ArrowRight, FastForward, Clock, Lock, CheckSquare 
} from 'lucide-react';

// Import Modals (Ensure you have this file created as per previous step)
import { AbortModal, SuccessModal } from '../components/interview/InterviewModals';

// --- UI COMPONENTS ---
const EvaAvatar = () => (<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 ring-2 ring-white/10 animate-pulse-slow">AI</div>);
const TypingIndicator = () => (<div className="flex space-x-1.5 p-2 items-center h-full"><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div></div>);

const SessionTimer = ({ isActive }) => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [isActive]);
    const format = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    return <span className="font-mono text-indigo-300 min-w-[40px] text-center">{format(seconds)}</span>;
};

// --- MAIN PAGE ---
const AIInterviewPage = () => {
    const { backendUrl } = useContext(AppContent);
    const { text, setText, isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const hasInitialized = useRef(false); // --- FIX: PREVENTS DOUBLE API CALL ---

    // State
    const [sessionId, setSessionId] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Logic State
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const [showAbortModal, setShowAbortModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]); 

    const { voice = 'female', sessionId: existingSessionId, isResuming } = location.state || {};

    // --- 1. VOICE PRE-LOADING ---
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // --- 2. SAFETY CHECKS ---
    useEffect(() => {
        if (!location.state) navigate('/ai-interviewer');
        const handleBeforeUnload = (e) => {
            if (!isSessionEnded) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [location.state, navigate, isSessionEnded]);

    // --- 3. VOICE ENGINE ---
    const speak = (textToSpeak) => {
        if (!textToSpeak || isSessionEnded) return;
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => { setIsSpeaking(false); if(!isSessionEnded) autoFocusInput(); };
        utterance.onerror = () => { setIsSpeaking(false); };

        if (availableVoices.length > 0) {
            const preferred = voice === 'male' 
                ? availableVoices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google US English')) 
                : availableVoices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google UK English Female'));
            utterance.voice = preferred || availableVoices[0];
        }
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        if(!isSessionEnded) autoFocusInput();
    };

    const autoFocusInput = () => setTimeout(() => inputRef.current?.focus(), 100);

    // --- 4. SESSION INIT (FIXED DUPLICATE ISSUE) ---
    useEffect(() => {
        // Prevent double execution in StrictMode
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        let isMounted = true;
        const initSession = async () => {
            setIsLoading(true);
            try {
                if (isResuming && existingSessionId) {
                    const res = await axios.get(`${backendUrl}/api/interviews/${existingSessionId}`);
                    if (res.data.success && isMounted) {
                        setSessionId(existingSessionId);
                        setHistory(res.data.data.conversationHistory);
                    }
                } else {
                    // Start New Session
                    const res = await axios.post(`${backendUrl}/api/interviews/start`);
                    if (res.data.success && isMounted) {
                        setSessionId(res.data.sessionId);
                        const initialMsg = res.data.initialMessage;
                        setHistory([{ role: 'model', text: initialMsg }]);
                        // Small delay for voice loading
                        setTimeout(() => speak(initialMsg), 500);
                    }
                }
            } catch (err) { 
                console.error(err);
                toast.error("Failed to connect to server."); 
            } finally { 
                if (isMounted) setIsLoading(false); 
            }
        };
        initSession();
        
        return () => { 
            isMounted = false; 
            window.speechSynthesis.cancel(); 
        };
    }, []); // Empty dependency array ensures run once

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, isLoading]);

    // --- 5. LOGIC HANDLERS ---

    // A. Auto Completion (AI triggers this)
    const checkAICompletion = (aiMessage) => {
        const lower = aiMessage.toLowerCase();
        const finishKeywords = [
            "interview is concluded", "thank you for your time", "end of the interview", 
            "concludes our session", "best of luck", "we are done"
        ];
        if (finishKeywords.some(k => lower.includes(k))) {
            finalizeSession(true);
        }
    };

    // B. Manual Completion (User clicks button)
    const handleManualFinish = () => {
        // --- LOGICAL GUARD: Minimum interaction required ---
        // Assuming 1 AI welcome + 1 User reply + 1 AI reply + 1 User reply = 4 messages minimum
        if (history.length < 5) {
            toast.warning("Interview too short to submit. Please continue answering.", {
                position: "top-center",
                autoClose: 3000
            });
            return;
        }
        
        // If valid, show success
        if (window.confirm("Are you sure you want to submit your interview now?")) {
            finalizeSession(true);
        }
    };

    // C. Common Finalize Function
    const finalizeSession = (isSuccess) => {
        setIsSessionEnded(true);
        stopSpeaking();
        if (isListening) stopListening();
        
        if (isSuccess) {
            setShowSuccessModal(true);
        }
    };

    // D. Safe Exit Handler (For Exit Button & Breadcrumb)
    const handleSafeExit = () => {
        if (isSessionEnded) {
            navigate('/ai-interviewer'); // Already done, just go back
        } else {
            setShowAbortModal(true); // Ongoing, show warning
        }
    };

    // --- 6. SEND HANDLER ---
    const handleSend = async (messageText) => {
        const msg = messageText.trim();
        if (!msg || !sessionId || isLoading || isSessionEnded) return;

        stopSpeaking(); 
        if (isListening) stopListening();

        setHistory(prev => [...prev, { role: 'user', text: msg }]);
        setText('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${backendUrl}/api/interviews/chat/${sessionId}`, { message: msg });
            if (res.data.success) {
                const reply = res.data.reply;
                setHistory(prev => [...prev, { role: 'model', text: reply }]);
                speak(reply);
                checkAICompletion(reply);
            }
        } catch (err) {
            toast.error("AI Error. Try again.");
            setHistory(prev => prev.slice(0, -1)); 
            setText(msg);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F1117] text-white font-sans overflow-hidden selection:bg-indigo-500/30 relative">
            
            {/* Modals */}
            {showAbortModal && (
                <AbortModal 
                    onCancel={() => setShowAbortModal(false)} 
                    onConfirm={() => { stopSpeaking(); navigate('/ai-interviewer'); }} 
                />
            )}
            {showSuccessModal && (
                <SuccessModal 
                    onHome={() => navigate('/ai-interviewer')} 
                    onViewReport={() => navigate(`/interviews/report/${sessionId}`)} 
                />
            )}

            {/* Header */}
            <header className="absolute top-0 w-full z-20 px-4 py-4 flex items-center justify-between bg-[#0F1117]/90 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    {/* BREADCRUMB - Secured Exit */}
                    <button onClick={handleSafeExit} className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                        <Home size={16} /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <ChevronRight size={14} className="text-slate-600" />
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <Clock size={14} className="text-indigo-400" />
                        <SessionTimer isActive={!isSessionEnded} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* FINISH BUTTON - Only shows if active */}
                    {!isSessionEnded && (
                        <button 
                            onClick={handleManualFinish}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600/10 text-green-400 border border-green-500/20 hover:bg-green-600/20 transition-all text-xs font-bold uppercase tracking-wider"
                        >
                            <CheckSquare size={14} /> Finish
                        </button>
                    )}

                    <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full border ${isSessionEnded ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex items-center gap-2'}`}>
                        {!isSessionEnded && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
                        {isSessionEnded ? 'COMPLETED' : 'LIVE'}
                    </span>
                    
                    <button onClick={handleSafeExit} className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors" title="Exit">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pt-20 pb-32 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-center my-4"><span className="text-[11px] uppercase tracking-widest font-semibold text-slate-600">{new Date().toLocaleDateString()}</span></div>

                    {history.map((msg, index) => (
                        <div key={index} className={`flex gap-4 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="mt-1"><EvaAvatar /></div>}
                            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-lg text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-[#1E212B] text-slate-200 border border-white/10 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Completion Message */}
                    {isSessionEnded && (
                        <div className="flex justify-center my-6 animate-fadeIn">
                             <span className="text-xs font-medium text-slate-300 bg-white/5 border border-white/10 px-6 py-2 rounded-full flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-400" /> Session Finalized.
                             </span>
                        </div>
                    )}

                    {isLoading && !isSessionEnded && <div className="flex gap-4 justify-start animate-fadeIn"><div className="mt-1"><EvaAvatar /></div><div className="p-4 rounded-2xl bg-[#1E212B] border border-white/10 rounded-bl-none flex items-center h-14"><TypingIndicator /></div></div>}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            
            {/* Input Footer */}
            <footer className={`absolute bottom-0 w-full z-20 p-4 sm:p-6 bg-gradient-to-t from-[#0F1117] via-[#0F1117] to-transparent transition-all duration-500 ${isSessionEnded ? 'grayscale opacity-70 pointer-events-none' : ''}`}>
                
                {isSpeaking && !isSessionEnded && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce-slow z-30 pointer-events-auto">
                        <button onClick={stopSpeaking} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg border border-white/10 transition-transform active:scale-95">
                            <FastForward size={14} fill="currentColor" /> SKIP READING
                        </button>
                    </div>
                )}

                {/* LOCK OVERLAY */}
                {isSessionEnded && (
                    <div className="absolute inset-0 z-50 bg-[#0F1117]/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl cursor-not-allowed border border-white/5">
                        <div className="flex items-center gap-2 text-white font-medium bg-[#1E212B] px-4 py-2 rounded-lg border border-white/10 shadow-xl">
                            <Lock size={16} /> Interview Ended
                        </div>
                    </div>
                )}

                <div className="max-w-3xl mx-auto relative bg-[#1E212B] rounded-2xl border border-white/10 shadow-2xl p-2 flex items-end gap-2 ring-1 ring-white/5">
                    <textarea 
                        ref={inputRef}
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        disabled={isSessionEnded} 
                        className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 focus:ring-0 resize-none py-3 px-4 max-h-32 min-h-[52px] text-base" 
                        placeholder={isSessionEnded ? "Session ended." : (isListening ? "Listening..." : "Type your answer...")} 
                        rows="1"
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if(isSpeaking) stopSpeaking(); else handleSend(text); } }}
                    />

                    {hasRecognitionSupport && (
                        <button onClick={isListening ? stopListening : startListening} disabled={isSessionEnded} className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/5 text-slate-400 hover:text-indigo-400'} disabled:opacity-30`}>
                            {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
                        </button>
                    )}
                    
                    <button onClick={() => handleSend(text)} disabled={isLoading || (!text.trim() && !isListening) || isSessionEnded} className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg hover:bg-indigo-500 disabled:opacity-30 disabled:bg-white/5 transition-all flex-shrink-0">
                        <Send size={20}/>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AIInterviewPage;