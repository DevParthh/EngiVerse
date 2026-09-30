import { useContext } from "react"; 
import { AppContent } from "../../context/AppContext"; 
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react"; 
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();
    const { user } = useContext(AppContent); 

    return (
        <section className="relative flex flex-col items-center justify-center pt-24 sm:pt-32 pb-12 overflow-hidden px-4 sm:px-6 min-h-[85vh]">
            
            {/* --- CONTENT (Z-10 to stay above background) --- */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-6xl text-center">
                
                {/* Badge */}
                <motion.div 
                    className="flex items-center gap-2 border border-indigo-500/20 bg-indigo-900/10 backdrop-blur-md text-indigo-300 rounded-full px-4 py-1.5 mb-6 shadow-lg shadow-indigo-900/10"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-sm font-medium tracking-wide">The Ultimate Engineering Ecosystem</span>
                </motion.div>

                {/* Headline */}
                <motion.h1 
                    className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6 drop-shadow-xl"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                >
                    <span className="block mb-2">Don't Just Study Engineering.</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 font-extrabold block">
                        Live It. Earn It. Build It.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p 
                    className="text-lg sm:text-xl text-slate-200 max-w-2xl leading-relaxed mb-8 text-shadow-sm font-medium"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                >
                    Stop juggling multiple tabs. Build ATS-proof resumes, practice AI interviews, and freelance for <span className="text-indigo-300 font-bold">EngiCoins</span>—all in one place.
                </motion.p>

                {/* --- SMART BUTTONS --- */}
                <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                >
                    {/* LOGIC: Check if user exists */}
                    {user ? (
                        // IF LOGGED IN: Show Dashboard Button (Purple/Indigo Theme)
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-full px-8 py-4 transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 text-lg"
                        >
                            <LayoutDashboard className="w-5 h-5" /> Launch Dashboard
                        </button>
                    ) : (
                        // IF NOT LOGGED IN: Show Get Started Button (Standard Indigo)
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full px-8 py-4 transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 text-lg"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </button>
                    )}

                    {/* Secondary Button (Same for both) */}
                    <button 
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 rounded-full px-8 py-4 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 text-lg"
                    >
                        <Sparkles className="w-5 h-5 text-indigo-400" /> Explore Features
                    </button>
                </motion.div>

            </div>
        </section>
    );
}