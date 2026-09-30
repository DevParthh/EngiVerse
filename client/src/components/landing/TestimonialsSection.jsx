import React, { useRef, useCallback, useMemo } from 'react';
import { MessageSquare, Star, StarHalf, CheckCircle2 } from 'lucide-react';
import { gsap } from "gsap";

// --- DATA ---
const cardsData = [
    {
        name: 'Aditi Sharma',
        handle: '@aditi_dev',
        date: '2 days ago',
        content: "EngiVerse is the only tab I keep open now. The resume builder actually got me shortlisted for my first internship!"
    },
    {
        name: 'Virat Kohli',
        handle: '@vk_engine',
        date: '1 week ago',
        content: "The competitive vibe in the Skill Exchange is unmatched. Solving doubts and topping the leaderboard feels like a century!"
    },
    {
        name: 'Rohit Sharma',
        handle: '@hitman_code',
        date: '3 days ago',
        content: "I used to struggle with DSA concepts. The AI mock interviewer helped me practice casually without any pressure."
    },
    {
        name: 'Vedant Bhamare',
        handle: '@vedant_b',
        date: '5 days ago',
        content: "Sold my handwritten notes on EngiMart for the first time. Feels good to earn from the effort I put into studying."
    },
    {
        name: 'Siddhesh Bagde',
        handle: '@sid_tech',
        date: 'Just now',
        content: "The whiteboard collaboration tool is buttery smooth. We built our entire final year project architecture here."
    },
    {
        name: 'Parth Thakur',
        handle: '@parth_stack',
        date: '1 day ago',
        content: "Finally, a platform that understands engineers. No clutter, just tools that actually help us grow."
    },
    {
        name: 'Ajinkya Deshmukh',
        handle: '@aj_codes',
        date: '4 days ago',
        content: "The roadmap guide clarified so much confusion for me. Now I know exactly what to learn next for backend dev."
    },
    {
        name: 'Ketan Kurhade',
        handle: '@ketan_k',
        date: '2 weeks ago',
        content: "I love the dark mode UI! It's so clean. Plus, earning coins for helping juniors is a great motivation."
    },
    {
        name: 'Yashraj Rathor',
        handle: '@yash_raj',
        date: '3 days ago',
        content: "EngiVerse turned my scattered resources into a streamlined workflow. Best thing to happen to our college community."
    }
];

// --- ⚡ INTENSE MAGIC CARD LOGIC ---
const GLOW_COLOR_RGB = "140, 80, 255"; // Brighter Neon Purple

const createParticleElement = (x, y) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px; height: 4px; border-radius: 50%;
    background: rgb(${GLOW_COLOR_RGB});
    box-shadow: 0 0 10px rgb(${GLOW_COLOR_RGB}); /* Stronger Glow */
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
        opacity: 0, scale: 0, duration: 0.8, ease: "power2.out",
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
        className={`relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/10 ${className} group-hover:border-indigo-500/50 transition-colors duration-500`}
        onMouseEnter={() => { isHoveredRef.current = true; spawnParticles(); }}
        onMouseLeave={() => { isHoveredRef.current = false; if(cardRef.current) cardRef.current.style.setProperty('--spotlight-opacity', '0'); }}
        onMouseMove={handleMouseMove}
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px', '--spotlight-opacity': '0' }}
    >
        {/* Intense Spotlight */}
        <div className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
            style={{ 
                background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.25), transparent 80%)`, 
                opacity: 'var(--spotlight-opacity)' 
            }} 
        />
        
        {/* Bright Border Glow */}
        <div className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none" 
            style={{ 
                padding: '2px', 
                background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(${GLOW_COLOR_RGB}, 0.9), transparent 60%)`, 
                opacity: 'var(--spotlight-opacity)', 
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', 
                maskComposite: 'exclude' 
            }} 
        />
        
        {/* Content */}
        <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const getRandomRating = () => {
    const ratings = [4, 4.5, 5];
    return ratings[Math.floor(Math.random() * ratings.length)];
};

const RatingStars = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={`full-${i}`} className="w-3 h-3 text-amber-500 fill-amber-500" />);
    }
    if (hasHalfStar) {
        stars.push(<StarHalf key="half" className="w-3 h-3 text-amber-500 fill-amber-500" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-slate-700 fill-slate-700/30" />);
    }
    return <div className="flex gap-0.5">{stars}</div>;
};

const TestimonialCard = ({ card }) => {
    const rating = useMemo(() => getRandomRating(), []);

    return (
        <div className="mx-4 w-[350px] shrink-0 group hover:z-10">
            <MagicCard className="h-full hover:-translate-y-2 transition-all duration-500 ease-out hover:shadow-[0_10px_40px_-10px_rgba(120,60,255,0.3)]">
                <div className="p-6 h-full flex flex-col justify-between relative">
                    
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
                                <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-white font-bold text-sm">
                                    {getInitials(card.name)}
                                </div>
                            </div>
                            
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-white font-bold text-base group-hover:text-indigo-300 transition-colors">{card.name}</p>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <span className="text-xs text-slate-500 font-mono group-hover:text-slate-400 transition-colors">{card.handle}</span>
                            </div>
                        </div>
                        
                        <p className="text-sm text-slate-300 leading-relaxed font-light group-hover:text-white transition-colors duration-300">
                            "{card.content}"
                        </p>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-slate-600 text-xs mt-6 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                        <p className="text-slate-500 group-hover:text-indigo-400 transition-colors">{card.date}</p>
                        <RatingStars rating={rating} />
                    </div>
                </div>
            </MagicCard>
        </div>
    );
};

export default function TestimonialsSection() {
    const seamlessData = useMemo(() => [...cardsData, ...cardsData, ...cardsData, ...cardsData], []);

    return (
        <section id="testimonials" className="relative py-24 bg-transparent overflow-hidden">
            
            {/* Header */}
            <div className="text-center mb-20 px-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <MessageSquare className="w-3 h-3" /> Wall of Love
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Backed by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Community.</span>
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                    See what fellow engineers are building, learning, and saying about EngiVerse.
                </p>
            </div>

            <style>{`
                @keyframes marqueeScroll {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-inner {
                    animation: marqueeScroll 120s linear infinite;
                    display: flex;
                    width: max-content;
                }
                .marquee-reverse {
                    animation-direction: reverse;
                }
                .marquee-row:hover .marquee-inner {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Row 1 */}
            <div className="marquee-row w-full overflow-hidden relative mb-12">
                <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-r from-black to-transparent"></div>
                <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-l from-black to-transparent"></div>
                
                <div className="marquee-inner">
                    {seamlessData.map((card, index) => (
                        <TestimonialCard key={`r1-${index}`} card={card} />
                    ))}
                </div>
            </div>

            {/* Row 2 */}
            <div className="marquee-row w-full overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-r from-black to-transparent"></div>
                <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-l from-black to-transparent"></div>
                
                <div className="marquee-inner marquee-reverse">
                    {seamlessData.map((card, index) => (
                        <TestimonialCard key={`r2-${index}`} card={card} />
                    ))}
                </div>
            </div>

        </section>
    );
}