import { useState, useContext } from "react";
import { AppContent } from "../../context/AppContext";
import { Menu, X, Coins, ChevronRight, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

export default function Navbar() {
    const { user } = useContext(AppContent);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Updated Links List
    const navlinks = [
        { href: "#features", text: "Features" },
        { href: "#roadmap", text: "Guide" },
        { href: "#about", text: "About" },
        { href: "#testimonials", text: "Testimonials" },
        { href: "#contact", text: "Contact" },
    ];

    return (
        <>
            <motion.nav 
                className="fixed top-0 z-50 flex items-center justify-between w-full h-20 px-6 md:px-12 lg:px-20 xl:px-32 backdrop-blur-lg bg-black/50 border-b border-white/5 font-poppins"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img 
                        className="w-28 sm:w-32 h-auto object-contain group-hover:opacity-80 transition-opacity" 
                        src={assets.logo} 
                        alt="EngiVerse" 
                    />
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8">
                    {navlinks.map((link) => (
                        <a 
                            key={link.href} 
                            href={link.href} 
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-indigo-500 after:transition-all hover:after:w-full"
                        >
                            {link.text}
                        </a>
                    ))}
                </div>

                {/* Desktop Buttons (Auth Logic) */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        // LOGGED IN: Single Dashboard Button
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all text-white text-sm font-semibold rounded-md shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </button>
                    ) : (
                        // NOT LOGGED IN: Login + Get Started
                        <>
                            <button 
                                onClick={() => navigate('/login')}
                                className="px-5 py-2 text-slate-300 hover:text-white font-medium transition-colors hover:bg-white/5 rounded-md border border-transparent hover:border-slate-700"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => navigate('/login')} // Assuming '/login' handles both or redirects to signup toggle
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-semibold rounded-md shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95 flex items-center gap-1"
                            >
                                Get Started <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-300 hover:text-white transition">
                    <Menu className="w-7 h-7" />
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 lg:hidden font-poppins"
                    >
                        <button 
                            onClick={() => setIsMenuOpen(false)} 
                            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {navlinks.map((link) => (
                            <a 
                                key={link.href} 
                                href={link.href} 
                                onClick={() => setIsMenuOpen(false)}
                                className="text-2xl font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
                            >
                                {link.text}
                            </a>
                        ))}

                        <div className="flex flex-col gap-4 mt-8 w-full px-10">
                            {user ? (
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                >
                                    <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-slate-200 transition"
                                    >
                                        Get Started
                                    </button>
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="w-full py-4 bg-white/10 text-white font-bold rounded-xl text-lg hover:bg-white/20 transition"
                                    >
                                        Login
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}