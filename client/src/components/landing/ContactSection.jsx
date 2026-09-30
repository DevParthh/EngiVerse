import React, { useState, useRef, useCallback } from 'react';
import { Mail, Copy, Check, Phone, Github, Linkedin, Youtube, Code2, Instagram, ArrowUpRight, Star, GitFork, Sparkles } from 'lucide-react';
import { gsap } from "gsap";

// --- ⚡ MAGIC CARD LOGIC ---
const GLOW_COLOR_RGB = "99, 102, 241"; // Indigo-500

const createParticleElement = (x, y) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 2px; height: 2px; border-radius: 50%;
    background: rgb(${GLOW_COLOR_RGB});
    box-shadow: 0 0 4px rgb(${GLOW_COLOR_RGB});
    pointer-events: none; z-index: 20;
    left: ${x}px; top: ${y}px; opacity: 1; mix-blend-mode: screen;
  `;
  return el;
};

const MagicCard = ({ children, className = "", onClick }) => {
  const cardRef = useRef(null);
  const isHoveredRef = useRef(false);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const particle = createParticleElement(Math.random() * rect.width, Math.random() * rect.height);
    cardRef.current.appendChild(particle);
    
    gsap.to(particle, {
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        opacity: 0, scale: 0, duration: 0.8, ease: "power2.out",
        onComplete: () => particle.remove()
    });

    if (isHoveredRef.current) setTimeout(spawnParticles, 400); 
  }, []);

  const handleMouseMove = (e) => {
    if(!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    cardRef.current.style.setProperty('--spotlight-opacity', '1');
  };

  return (
    <div 
        ref={cardRef}
        onClick={onClick}
        className={`relative overflow-hidden bg-[#0A0A0A] border border-white/5 ${className} transition-all duration-300`}
        onMouseEnter={() => { isHoveredRef.current = true; spawnParticles(); }}
        onMouseLeave={() => { isHoveredRef.current = false; if(cardRef.current) cardRef.current.style.setProperty('--spotlight-opacity', '0'); }}
        onMouseMove={handleMouseMove}
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px', '--spotlight-opacity': '0' }}
    >
        <div className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.1), transparent 80%)`, opacity: 'var(--spotlight-opacity)' }} />
        <div className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none" 
            style={{ padding: '1px', background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.4), transparent 60%)`, opacity: 'var(--spotlight-opacity)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
        <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

// --- TILES ---
const SocialTile = ({ icon: Icon, title, link }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full">
        <MagicCard className="rounded-xl h-full group hover:border-indigo-500/30">
            <div className="p-5 flex flex-col justify-between h-[140px]">
                <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-white/5 rounded-lg text-slate-300 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                    <h3 className="text-white font-medium text-sm">{title}</h3>
                    <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">Connect</p>
                </div>
            </div>
        </MagicCard>
    </a>
);

export default function ContactSection() {
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("s.akshat340@gmail.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="contact" className="relative py-20 px-4 bg-transparent z-10">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Let's <span className="text-indigo-500">Connect.</span>
                    </h2>
                    <p className="text-slate-400 text-sm">Open for collaborations and opportunities.</p>
                </div>

                {/* --- BENTO GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    
                    {/* 1. EMAIL (Spans 2) */}
                    <div className="col-span-2">
                        <MagicCard className="rounded-xl h-full group hover:border-indigo-500/30">
                            <div className="p-6 flex flex-col justify-center items-start h-full min-h-[140px]">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-md text-indigo-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">Email Me</span>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-4 break-all">s.akshat340@gmail.com</h3>
                                <button onClick={handleCopyEmail} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg text-xs font-medium hover:bg-white/10 active:scale-95 transition-all">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </MagicCard>
                    </div>

                    {/* 2. LINKEDIN & GITHUB */}
                    <SocialTile icon={Linkedin} title="LinkedIn" link="https://www.linkedin.com/in/akshat-sharma-6664422b3" />
                    <SocialTile icon={Github} title="GitHub" link="https://github.com/AkshatSharma555" />
                    
                    {/* 3. ROW 2 */}
                    <SocialTile icon={Code2} title="LeetCode" link="https://leetcode.com/u/Akshat_Sharma_518/" />
                    <SocialTile icon={Instagram} title="Instagram" link="https://www.instagram.com/akshat_518s/" />
                    
                    {/* PHONE (Spans 2) */}
                    <div className="col-span-2">
                        <a href="tel:8766415768" className="block h-full">
                            <MagicCard className="rounded-xl h-full group hover:border-emerald-500/30">
                                <div className="p-6 flex items-center justify-between h-[140px]">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-emerald-500/10 rounded-md text-emerald-400">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Call Me</span>
                                        </div>
                                        <p className="text-xl font-bold text-white mt-1">+91 87664 15768</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                                        <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                                    </div>
                                </div>
                            </MagicCard>
                        </a>
                    </div>

                    {/* 4. ROW 3: YOUTUBE (1 Col) + CTA (3 Cols) */}
                    <div className="col-span-2 md:col-span-1">
                        <SocialTile icon={Youtube} title="YouTube" link="https://www.youtube.com/@Akshat_sharma." />
                    </div>

                    {/* --- NEW GITHUB CTA (Fills the remaining 3 columns) --- */}
                    <div className="col-span-2 md:col-span-3">
                        <a href="https://github.com/AkshatSharma555/EngiVerse-App" target="_blank" rel="noopener noreferrer" className="block h-full">
                            <MagicCard className="rounded-xl h-full border-indigo-500/20 hover:border-indigo-500/50 group">
                                <div className="p-6 h-full flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                    
                                    {/* Background Decor */}
                                    <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />

                                    {/* Left Text */}
                                    <div className="flex flex-col gap-1 z-10 text-center md:text-left">
                                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                            Ready to <span className="text-indigo-400">Contribute?</span>
                                        </h3>
                                        <p className="text-slate-400 text-sm font-medium">
                                            Help us build the future of engineering.
                                        </p>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-xs font-medium text-slate-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                            <span>Open Source Project by <span className="text-slate-300">Akshat Sharma</span></span>
                                        </div>
                                    </div>

                                    {/* Right Button */}
                                    <div className="group/btn relative inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-300 z-10 shrink-0">
                                        <Github className="w-5 h-5 text-white/90 group-hover/btn:text-white" />
                                        <span className="font-semibold tracking-wide text-sm">Star on GitHub</span>
                                        <div className="flex items-center justify-center bg-indigo-800/50 border border-indigo-400/30 w-7 h-7 rounded-full group-hover/btn:bg-yellow-400/20 group-hover/btn:border-yellow-400/50 transition-all duration-300">
                                            <Star className="w-3.5 h-3.5 text-indigo-100 group-hover/btn:text-yellow-300 group-hover/btn:fill-yellow-300 transition-all duration-300" />
                                        </div>
                                    </div>

                                </div>
                            </MagicCard>
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
}