import { useState, useEffect } from "react";
//import { motion } from "framer-motion";

// --- IMPORT LOCAL IMAGES ---
import resumeImg from "../../assets/features/ai_resume.jpeg";
import interviewImg from "../../assets/features/mock_interview.jpeg";
import boardImg from "../../assets/features/engiboard.jpeg";
import jobImg from "../../assets/features/job_portal.jpeg";
import skillImg from "../../assets/features/skill_exchange.jpeg";
import martImg from "../../assets/features/engimart.jpeg";

// --- REUSABLE SECTION TITLE ---
const SectionTitle = ({ title, description }) => (
    <div className="flex flex-col items-center text-center mb-10 px-4 z-10 relative">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
        >
            Why Choose EngiVerse?
        </motion.div>
        
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl"
        >
            {title}
        </motion.h2>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-200 max-w-2xl text-base md:text-lg font-light drop-shadow-md"
        >
            {description}
        </motion.p>
    </div>
);

export default function FeaturesSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false); // State to handle Pause on Hover

    const sectionData = [
        {
            title: "AI Resume Studio",
            description: "Craft a profile that beats the scan, a digital edge for the modern man. With AI precision and templates sleek, turn a generic CV into the unique.",
            image: resumeImg, 
        },
        {
            title: "Mock Interviewer",
            description: "Face the bot before the crowd, speak your answers clear and loud. Real-time feedback sharp and true, refining the professional version of you.",
            image: interviewImg,
        },
        {
            title: "EngiBoard",
            description: "Sketch the logic, map the flow, watch your system architecture grow. A canvas infinite for minds that dream, collaborating live in a digital stream.",
            image: boardImg,
        },
        {
            title: "Job Portal",
            description: "Filter the noise, find the gold, stories of success waiting to be told. Zero spam, just roles aligned, leaving the average grind behind.",
            image: jobImg,
        },
        {
            title: "Skill Exchange",
            description: "Share your code, earn the prize, rising high in your peers' eyes. Post a bounty or solve a doubt, that's what EngiCoins are all about.",
            image: skillImg,
        },
        {
            title: "EngiMart",
            description: "Unlock the vault where wisdom lies, premium resources for the wise. Trade your coins for assets grand, the finest engineering notes in the land.",
            image: martImg,
        },
    ];

    // --- AUTO PLAY LOGIC ---
    useEffect(() => {
        // Agar user hover kar rha hai, toh timer mat chalao
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % sectionData.length);
        }, 2500); // 2.5 Seconds (Thoda sa saans lene ka time diya text padhne ke liye)

        return () => clearInterval(interval);
    }, [isPaused, sectionData.length]);

    return (
        <section 
            id="features" 
            className="flex flex-col items-center pt-10 pb-24 px-4 overflow-hidden relative min-h-[90vh] bg-transparent z-10 scroll-mt-24"
        >
            <SectionTitle
                title="Our Latest Creations"
                description="Powerful modules designed to accelerate your engineering journey."
            />

            <div 
                className="flex flex-col md:flex-row gap-4 h-[600px] md:h-[550px] w-full max-w-7xl mx-auto px-2 md:px-8"
                // Pause auto-play when mouse enters the container
                onMouseEnter={() => setIsPaused(true)}
                // Resume auto-play when mouse leaves
                onMouseLeave={() => setIsPaused(false)}
            >
                {sectionData.map((data, index) => (
                    <motion.div 
                        key={data.title} 
                        className={`
                            relative group rounded-3xl overflow-hidden cursor-pointer border border-white/10 shadow-2xl
                            hidden md:block
                            /* SMOOTH TRANSITION */
                            transition-[flex] duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                            ${index === activeIndex ? "flex-[5]" : "flex-[1]"}
                        `}
                        // Hover karte hi Active Index change karo
                        onMouseEnter={() => setActiveIndex(index)}
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Background Image - Subtle Zoom on Active */}
                        <img 
                            className={`
                                h-full w-full object-cover transition-transform duration-1000 ease-out
                                ${index === activeIndex ? "scale-105" : "scale-100 group-hover:scale-110 opacity-60 group-hover:opacity-80"}
                            `}
                            src={data.image} 
                            alt={data.title} 
                        />
                        
                        {/* Gradient Overlay */}
                        <div className={`
                            absolute inset-0 bg-gradient-to-t 
                            transition-colors duration-500
                            ${index === activeIndex ? "from-black/90 via-black/50 to-transparent" : "from-black/80 via-transparent to-transparent"}
                        `} />

                        {/* CONTENT CONTAINER */}
                        <div className={`
                            absolute inset-0 flex flex-col justify-end p-8
                            transition-all duration-500
                        `}>
                            {/* TEXT WRAPPER (Glitch Free) */}
                            <div className={`
                                min-w-[300px] transform transition-all duration-500 ease-out
                                ${index === activeIndex 
                                    ? "opacity-100 translate-y-0 delay-300" 
                                    : "opacity-0 translate-y-8 delay-0 pointer-events-none absolute"} 
                            `}>
                                <h3 className="text-3xl font-bold mb-3 text-white drop-shadow-md whitespace-nowrap">
                                    {data.title}
                                </h3>
                                <p className="text-base md:text-lg text-slate-200 font-medium leading-relaxed italic opacity-90 max-w-lg">
                                    "{data.description}"
                                </p>
                            </div>
                        </div>
                        
                        {/* VERTICAL TITLE (Collapsed State) */}
                        <div className={`
                            absolute inset-0 flex items-center justify-center pb-8
                            transition-all duration-300 ease-in-out
                            ${index === activeIndex ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0 delay-200"}
                        `}>
                            <h3 
                                className="text-xl font-bold text-white/80 tracking-widest uppercase whitespace-nowrap drop-shadow-md"
                                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            >
                                {data.title}
                            </h3>
                        </div>

                    </motion.div>
                ))}

                {/* Mobile View - Standard Stack */}
                <div className="md:hidden flex flex-col gap-4 w-full h-full overflow-y-auto px-2">
                    {sectionData.map((data, index) => (
                        <div key={index} className="relative shrink-0 rounded-2xl overflow-hidden h-64 border border-white/10 shadow-lg">
                            <img className="h-full w-full object-cover" src={data.image} alt={data.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-2xl font-bold text-white">{data.title}</h3>
                                <p className="text-sm text-slate-200 mt-2 italic leading-relaxed">"{data.description}"</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}