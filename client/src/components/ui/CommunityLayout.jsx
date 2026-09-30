import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import CommunitySidenav from './CommunitySidenav';
import Squares from './Squares'; 
import { Menu, X } from 'lucide-react'; // 🔥 Icons Import kiye

const CommunityLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // 🔥 Auto-close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <div className='min-h-screen bg-slate-50 relative font-sans text-slate-900'>
            
            {/* --- Animated Background (Fixed at bottom layer) --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Squares />
            </div>

            {/* --- 1. Fixed Top Navbar --- */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Navbar theme="light" /> 
            </div>

            {/* --- 2. Main Wrapper --- */}
            <div className="pt-16 flex min-h-screen relative z-10"> 
                
                {/* --- 3. Professional Sidebar (Desktop - Fixed Left) --- */}
                <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 top-16 bg-white/90 backdrop-blur-xl border-r border-slate-200 z-40">
                    <CommunitySidenav />
                </aside>

                {/* --- 4. Main Content Area --- */}
                <main className="flex-1 lg:ml-64 min-w-0 p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* 🔥 MOBILE MENU BUTTON (Only Visible on Mobile) */}
                        <div className="lg:hidden mb-6">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm text-slate-700 font-bold active:scale-95 transition-all"
                            >
                                <Menu className="w-5 h-5" />
                                <span>Menu</span>
                            </button>
                        </div>

                        <Outlet />
                    </div>
                </main>

            </div>

            {/* --- 5. MOBILE DRAWER (Overlay) --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop (Click to close) */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col border-r border-slate-200">
                        
                        {/* Drawer Header */}
                        <div className="p-4 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <span className="font-bold text-slate-800">Community Menu</span>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Sidebar Component Rendered Here */}
                        <div className="flex-1 overflow-y-auto bg-white/90">
                            <CommunitySidenav />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityLayout;