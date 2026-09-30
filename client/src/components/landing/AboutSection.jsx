import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import ProfileCard from './ProfileCard'; 

export default function AboutSection() {
    return (
        <section id="about" className="relative py-20 px-4 min-h-[80vh] bg-transparent z-10 scroll-mt-20 overflow-hidden">
            
            {/* CHANGE 1: max-w-full kar diya taaki puri screen use ho.
               CHANGE 2: 'xl:grid-cols-2' ko 'lg:grid-cols-2' kar diya. 
                         Ab Laptop/Zoom par bhi Side-by-Side rahega.
            */}
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                
                {/* LEFT SIDE: PROFILE CARD */}
                {/* 'min-w-0' prevents flex/grid blowout */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="w-full flex justify-center lg:justify-end order-2 lg:order-1 min-w-0"
                >
                    {/* Wrapper div to control scaling if needed */}
                    <div className="w-full flex justify-center lg:justify-end">
                        <ProfileCard />
                    </div>
                </motion.div>

                {/* RIGHT SIDE: THE VISION */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-left order-1 lg:order-2 max-w-xl mx-auto lg:mx-0 flex flex-col justify-center h-full pl-0 lg:pl-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md self-start">
                        <Sparkles className="w-3 h-3" /> Our Vision
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        From <span className="text-slate-500 line-through decoration-pink-500 decoration-4 opacity-70">Confusion</span> <br />
                        To <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Unstoppable Confidence.</span>
                    </h2>

                    <div className="space-y-5 text-base md:text-lg text-slate-300 font-light">
                        <p>
                            Engineering shouldn't feel like a lonely struggle. <strong className="text-white">Scattered resources, weak resumes, and fear of interviews</strong>—I faced it all.
                        </p>
                        
                        <p>
                            EngiVerse solves this by unifying your journey. We built one ecosystem where you don't just study code, but you <strong className="text-indigo-400">Build, Collaborate, and Earn</strong> from it.
                        </p>

                        <div className="relative bg-white/5 border-l-4 border-pink-500 p-5 rounded-r-xl my-4">
                            <Quote className="absolute top-3 right-3 w-5 h-5 text-white/10" />
                            <p className="italic text-slate-200 font-medium text-sm md:text-base">
                                "We believe students shouldn’t just memorize theory. They should practice skills, help peers, and build real careers while still in college."
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-white font-medium pt-2">
                            <span className="w-8 h-[1px] bg-pink-500"></span>
                            <p>Live it. Earn it. Build it.</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
                        <div>
                            <p className="text-white font-bold text-lg font-handwriting">Akshat Sharma</p>
                            <p className="text-slate-500 text-xs tracking-widest uppercase mt-0.5">Founder, EngiVerse</p>
                        </div>
                    </div>

                </motion.div>

            </div>

        </section>
    );
}