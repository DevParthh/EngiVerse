import React, { useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, Mic, Coins, ShoppingBag, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // Ensure react-router-dom is installed
import { gsap } from "gsap";

// --- ⚡ MAGIC CARD LOGIC (Localized) ---
const GLOW_COLOR_RGB = "120, 60, 255"; 

const createParticleElement = (x, y) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 3px; height: 3px; border-radius: 50%;
    background: rgb(${GLOW_COLOR_RGB});
    box-shadow: 0 0 6px rgb(${GLOW_COLOR_RGB});
    pointer-events: none; z-index: 20;
    left: ${x}px; top: ${y}px; opacity: 1; mix-blend-mode: screen;
  `;
  return el;
};

const MagicCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);
  const isHoveredRef = useRef(false);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const particle = createParticleElement(Math.random() * rect.width, Math.random() * rect.height);
    cardRef.current.appendChild(particle);
    
    gsap.to(particle, {
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        opacity: 0, scale: 0, duration: 1.2, ease: "power2.out",
        onComplete: () => particle.remove()
    });

    if (isHoveredRef.current) setTimeout(spawnParticles, 300);
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
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={() => { isHoveredRef.current = true; spawnParticles(); }}
        onMouseLeave={() => { isHoveredRef.current = false; if(cardRef.current) cardRef.current.style.setProperty('--spotlight-opacity', '0'); }}
        onMouseMove={handleMouseMove}
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px', '--spotlight-opacity': '0' }}
    >
        <div className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.15), transparent 80%)`, opacity: 'var(--spotlight-opacity)' }} />
        <div className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none" 
            style={{ padding: '1px', background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.5), transparent 60%)`, opacity: 'var(--spotlight-opacity)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
        <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

// --- DATA ---
const roadmapSteps = [
    {
        id: 1,
        title: "Build Your Foundation",
        subtitle: "AI Resume Studio",
        desc: "Start by crafting an ATS-proof resume. Choose from 10+ themes, auto-fix grammar with AI, and export a perfect profile.",
        icon: <FileText className="w-6 h-6 text-white" />,
        color: "bg-indigo-500",
        glow: "shadow-[0_0_30px_rgba(99,102,241,0.5)]"
    },
    {
        id: 2,
        title: "Master the Interview",
        subtitle: "AI Mock Interviewer",
        desc: "Face our AI bot. It speaks, listens, and adapts questions based on your role. Get a real-time score and detailed feedback.",
        icon: <Mic className="w-6 h-6 text-white" />,
        color: "bg-purple-500",
        glow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]"
    },
    {
        id: 3,
        title: "The Hustle (Earn Coins)",
        subtitle: "Skill Exchange",
        desc: "Stuck? Ask for help. Know the answer? Solve doubts and earn EngiCoins. Complete bounties to build your net worth.",
        icon: <Coins className="w-6 h-6 text-yellow-300" />,
        color: "bg-amber-500",
        glow: "shadow-[0_0_30px_rgba(245,158,11,0.5)]",
        badge: "EARN ⚡"
    },
    {
        id: 4,
        title: "Unlock The Vault (Spend)",
        subtitle: "EngiMart",
        desc: "Use your hard-earned EngiCoins to unlock premium handwritten notes, cheat sheets, and project templates from the vault.",
        icon: <ShoppingBag className="w-6 h-6 text-white" />,
        color: "bg-pink-500",
        glow: "shadow-[0_0_30px_rgba(236,72,153,0.5)]",
        badge: "SPEND 🛒"
    },
    {
        id: 5,
        title: "Land The Dream Job",
        subtitle: "Smart Job Portal",
        desc: "Apply to curated internships and full-time roles. Zero spam, just verified opportunities matching your new skills.",
        icon: <Briefcase className="w-6 h-6 text-white" />,
        color: "bg-emerald-500",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.5)]"
    }
];

const TimelineCard = ({ step, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`flex flex-col md:flex-row gap-8 items-center mb-24 w-full ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
        >
            {/* CONTENT CARD WITH MAGIC BENTO */}
            <div className={`w-full md:w-5/12`}>
                <MagicCard className="rounded-2xl bg-[#0A0A0A] border border-white/5 hover:bg-[#0F0F0F] transition-colors group">
                    <div className="p-8 relative">
                        {step.badge && (
                            <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full border bg-black/50 backdrop-blur-md ${step.id === 3 ? 'text-amber-400 border-amber-500/50' : 'text-pink-400 border-pink-500/50'}`}>
                                {step.badge}
                            </span>
                        )}

                        <h4 className={`text-xs font-bold tracking-widest uppercase mb-2 ${step.id === 3 ? 'text-amber-400' : step.id === 4 ? 'text-pink-400' : 'text-indigo-400'}`}>
                            Step 0{step.id}
                        </h4>
                        <h3 className="text-2xl font-bold text-white mb-2">{step.subtitle}</h3>
                        <h4 className="text-base text-slate-400 font-medium mb-4">{step.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                            {step.desc}
                        </p>
                    </div>
                </MagicCard>
            </div>

            {/* CENTER CONNECTOR */}
            <div className="relative flex items-center justify-center w-12 md:w-2/12 z-10">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${step.color} ${step.glow} border-4 border-[#050505] relative z-10 shadow-2xl`}>
                    {step.icon}
                </div>
            </div>

            {/* EMPTY SPACE */}
            <div className="hidden md:block w-5/12" />
        </motion.div>
    );
};

export default function RoadmapSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <section id="roadmap" className="relative py-24 px-4 min-h-screen bg-transparent overflow-hidden">
            
            {/* HEADER */}
            <div className="flex flex-col items-center text-center mb-24 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-1.5 mb-4 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
                >
                    The EngiVerse Journey
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-xl"
                >
                    From Student to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Professional</span>
                </motion.h2>
                <p className="text-slate-400 max-w-2xl text-lg">
                    A complete ecosystem designed to take you from learning to earning. Follow the roadmap.
                </p>
            </div>

            {/* TIMELINE CONTAINER */}
            <div ref={ref} className="relative w-full max-w-6xl mx-auto">
                
                {/* VERTICAL LINE (Electric Style) */}
                <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 h-full">
                    <motion.div 
                        className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        style={{ height: "100%", scaleY: scaleY, transformOrigin: "top" }}
                    />
                </div>

                {/* STEPS */}
                <div className="flex flex-col items-start md:items-center relative z-10 pl-16 md:pl-0">
                    {roadmapSteps.map((step, index) => (
                        <TimelineCard key={step.id} step={step} index={index} />
                    ))}
                </div>

                {/* FINAL CALL TO ACTION */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex justify-center mt-16 relative z-10"
                >
                    <Link to="/login"> {/* Make sure this route exists */}
                        <div className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                            
                            {/* Shiny Sweep Effect */}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent group-hover:animate-shine" />
                            
                            <CheckCircle2 className="w-6 h-6 text-green-600 relative z-10" />
                            <span className="relative z-10">Start Your Journey</span>
                            <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform relative z-10" />
                        </div>
                    </Link>
                </motion.div>

            </div>
            
            {/* Animation for shiny button */}
            <style>{`
                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                .group:hover .group-hover\\:animate-shine {
                    animation: shine 0.7s ease-in-out;
                }
            `}</style>
        </section>
    );
}