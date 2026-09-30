import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Github, Linkedin, Globe, Trophy, CheckCircle2, Sparkles, Code2, GraduationCap } from "lucide-react";
import { gsap } from "gsap";
import ElectricBorder from "../reactbits/ElectricBorder"; 

import profileImg from "../../assets/akshat_profile.png"; 

// --- ⚡ PARTICLES LOGIC ---
const GLOW_COLOR_RGB = "200, 60, 255"; 

const createParticleElement = (x, y) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px; height: 4px; border-radius: 50%;
    background: rgb(${GLOW_COLOR_RGB});
    box-shadow: 0 0 6px rgb(${GLOW_COLOR_RGB});
    pointer-events: none; z-index: 20;
    left: ${x}px; top: ${y}px; opacity: 1; mix-blend-mode: screen;
  `;
  return el;
};

const ParticleCard = ({ children, className = "" }) => {
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

    if (isHoveredRef.current) setTimeout(spawnParticles, 500); 
  }, []);

  const handleMouseMove = (e) => {
    if(!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    requestAnimationFrame(() => {
        cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        cardRef.current.style.setProperty('--spotlight-opacity', '1');
    });
  };

  return (
    <div 
        ref={cardRef}
        className={`relative overflow-hidden group/card ${className} will-change-transform`}
        onMouseEnter={() => { isHoveredRef.current = true; spawnParticles(); }}
        onMouseLeave={() => { isHoveredRef.current = false; if(cardRef.current) cardRef.current.style.setProperty('--spotlight-opacity', '0'); }}
        onMouseMove={handleMouseMove}
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px', '--spotlight-opacity': '0' }}
    >
        <div className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.1), transparent 80%)`, opacity: 'var(--spotlight-opacity)' }} />
        <div className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none" 
            style={{ padding: '1px', background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.5), transparent 60%)`, opacity: 'var(--spotlight-opacity)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
        <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default function ProfileCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 400, damping: 90 });
  const mouseY = useSpring(y, { stiffness: 400, damping: 90 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  const rotateX = useTransform(mouseY, [-200, 200], [2, -2]); 
  const rotateY = useTransform(mouseX, [-200, 200], [-2, 2]);

  return (
    // CHANGE: Added 'w-full' and logic to handle width
    <div className="perspective-[1500px] w-full flex justify-center p-2 lg:p-4">
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // CHANGE: max-w is now 950px, but it will shrink (w-full) if needed without breaking layout
        // 'lg:scale-[0.85] xl:scale-100' -> This helps fit on smaller laptops without reflowing
        className="relative w-full max-w-[950px] bg-[#0A0A0A] rounded-[1.5rem] shadow-2xl origin-center lg:origin-top-right xl:origin-center will-change-transform" 
      >
        
        <ElectricBorder 
            color="#BB86FC" 
            speed={2}
            chaos={0.3}
            thickness={2} 
            style={{ borderRadius: '1.5rem', overflow: 'hidden' }} 
        >
            <div className="p-4 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/10 blur-3xl -z-10" />

                {/* CHANGE: Added 'lg:grid-cols-12' to force side-by-side even on laptops */}
                <div style={{ transform: "translateZ(20px)" }} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* LEFT COLUMN */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden shadow-lg relative h-full flex flex-col">
                        <div className="h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <div className="relative -mt-10 flex justify-center">
                            <div className="p-1.5 rounded-full bg-[#121212]">
                                <img src={profileImg} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-[#121212] ring-2 ring-white/10" />
                            </div>
                        </div>
                        <div className="text-center px-4 pb-4 pt-1 flex-grow flex flex-col">
                            <h2 className="text-white font-bold text-base flex items-center justify-center gap-1.5">
                                Akshat Sharma <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                            </h2>
                            <p className="text-slate-400 text-[11px] font-medium mt-0.5">SIES Graduate School of Technology</p>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 mb-4 font-mono font-bold">IT • Class of 2027</p>
                            
                            <div className="flex justify-center gap-3 mb-4">
                                {[Linkedin, Github, Globe].map((Icon, i) => (
                                    <div key={i} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"><Icon className="w-4 h-4" /></div>
                                ))}
                            </div>
                            <button className="mt-auto w-full py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold tracking-wide hover:bg-indigo-500 transition-all">Edit Profile</button>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Achievements</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-lg border border-white/5">
                                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-xs text-slate-200">Helping Hand</span>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-lg border border-white/5">
                                <Trophy className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs text-slate-200">Community Contributor</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                    <ParticleCard className="rounded-xl border border-white/10 bg-[#121212]">
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-sm font-bold text-white">About Me</h3>
                            </div>
                            <p className="text-xs text-slate-300 leading-5">
                                I'm an IT Engineering student skilled in Java, Python, and Full-Stack Development. As a LeetCode DSA practitioner, I'm passionate about solving problems and building impactful technology.
                            </p>
                        </div>
                    </ParticleCard>

                    <ParticleCard className="rounded-xl border border-white/10 bg-[#121212]">
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Code2 className="w-4 h-4 text-pink-400" />
                                <h3 className="text-sm font-bold text-white">Skills & Tech Stack</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {["Java", "Python", "JavaScript", "DSA", "Problem Solving", "System Design", "React", "Node.js", "Prompt Eng", "REST APIs"].map((skill, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-[#1A1A1A] border border-white/10 rounded-md text-[10px] font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </ParticleCard>

                    <ParticleCard className="rounded-xl border border-white/10 bg-[#121212] flex-grow">
                        <div className="p-5 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <GraduationCap className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-bold text-white">Academic & Contact</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                {[
                                    { label: "Email", val: "s.akshat340@gmail.com" },
                                    { label: "College", val: "SIES Graduate School" },
                                    { label: "Branch", val: "Information Technology" },
                                    { label: "Graduation", val: "2027", isBadge: true }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">{item.label}</p>
                                        {item.isBadge ? (
                                            <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[11px] text-white font-mono font-bold">{item.val}</span>
                                        ) : (
                                            <p className="text-[11px] text-white font-medium truncate">{item.val}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ParticleCard>
                </div>
                </div>
            </div>
        </ElectricBorder>
      </motion.div>
    </div>
  );
}