import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Code2 } from 'lucide-react';

const FooterLink = ({ href, text }) => (
    <a 
        href={href} 
        className="text-slate-400 hover:text-indigo-400 text-sm transition-all duration-300 w-fit relative group"
    >
        {text}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
    </a>
);

export default function Footer() {
    return (
        <footer className="relative w-full pt-20 pb-10 px-6 md:px-12 border-t border-white/5 bg-[#050505]/90 backdrop-blur-2xl z-20 overflow-hidden">
            
            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* --- TOP SECTION: BRAND & LINKS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    
                    {/* Brand Column (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 pr-4">
                        <div className="flex items-center gap-2.5">
                            {/* EngiVerse Logo Area */}
                            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg shadow-indigo-500/20">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                EngiVerse
                            </span>
                        </div>
                        
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            Empowering the next generation of engineers. We provide the ecosystem, tools, and community you need to go from <span className="text-slate-200 font-medium">classroom concepts</span> to <span className="text-indigo-400 font-medium">career success.</span>
                        </p>
                    </div>

                    {/* Links Column 1: Platform */}
                    <div className="lg:col-span-2 lg:col-start-7">
                        <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Platform</h4>
                        <div className="flex flex-col gap-3">
                            <FooterLink href="#" text="Resume Builder" />
                            <FooterLink href="#" text="Roadmap Guide" />
                            <FooterLink href="#" text="EngiMart" />
                            <FooterLink href="#" text="Mock Interviews" />
                        </div>
                    </div>

                    {/* Links Column 2: Company */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Company</h4>
                        <div className="flex flex-col gap-3">
                            <FooterLink href="#" text="About Us" />
                            <FooterLink href="#" text="Blog" />
                            <FooterLink href="#" text="Careers" />
                            <FooterLink href="#" text="Contact" />
                        </div>
                    </div>

                    {/* Links Column 3: Legal */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Legal</h4>
                        <div className="flex flex-col gap-3">
                            <FooterLink href="#" text="Privacy Policy" />
                            <FooterLink href="#" text="Terms of Use" />
                            <FooterLink href="#" text="Cookie Policy" />
                        </div>
                    </div>

                </div>

                {/* --- SEPARATOR --- */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

                {/* --- BOTTOM SECTION: COPYRIGHT & CREDIT --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                    
                    <p className="text-slate-500 font-medium text-xs md:text-sm">
                        © 2025 EngiVerse Inc. All rights reserved.
                    </p>

                    {/* THE SIGNATURE PILL */}
                    <motion.a 
                        href="https://www.linkedin.com/in/akshat-sharma-6664422b3/"
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
                    >
                        <span className="text-slate-400 group-hover:text-slate-300 transition-colors text-xs uppercase tracking-wider font-semibold">Crafted by</span>
                        <div className="h-4 w-[1px] bg-white/10 group-hover:bg-indigo-500/30 transition-colors" />
                        <span className="font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Akshat Sharma
                        </span>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse ml-0.5" />
                    </motion.a>

                </div>
            </div>

            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        </footer>
    );
}