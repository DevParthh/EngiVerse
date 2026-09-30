import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import FeaturesSection from '../components/landing/FeaturesSection';
import RoadmapSection from '../components/landing/RoadmapSection'; 
import AboutSection from '../components/landing/AboutSection'; 
import TestimonialsSection from '../components/landing/TestimonialsSection'; 
import ContactSection from '../components/landing/ContactSection'; 
import LiquidEther from '../components/landing/LiquidEther';
import Footer from '../components/landing/Footer';

const Home = () => {
  return (
    <div className="relative w-full min-h-screen bg-black text-white font-outfit selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 0. GLOBAL SMOOTH SCROLL */}
      <style>{`html { scroll-behavior: smooth; }`}</style>

      {/* 1. BACKGROUND (Fixed & Ambient) */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
         <LiquidEther 
            colors={['#1e3a8a', '#4338ca', '#6d28d9']} 
            mouseForce={25}
            cursorSize={100}
         />
      </div>

      {/* 2. NAVBAR (Sticky/Fixed) */}
      <Navbar />

      {/* 3. MAIN SCROLLABLE CONTENT */}
      <main className="relative z-10 flex flex-col">
          
          {/* Hero Section (Top) */}
          <section id="home">
              <Hero />
          </section>
          
          {/* Features Section */}
          <div id="features" className="relative border-t border-white/5 scroll-mt-24">
              <FeaturesSection />
          </div>

          {/* Roadmap / Guide Section */}
          <div id="guide" className="relative border-t border-white/5 scroll-mt-24">
              <RoadmapSection />
          </div>

          {/* About & Profile Section */}
          <div id="about" className="relative border-t border-white/5 scroll-mt-24">
              <AboutSection />
          </div>

          {/* Testimonials Section */}
          <div id="testimonials" className="relative border-t border-white/5 scroll-mt-24">
              <TestimonialsSection />
          </div>
          
          {/* Contact Section */}
          <div id="contact" className="relative border-t border-white/5 scroll-mt-24">
              <ContactSection />
          </div>
          
          {/* Footer */}
          <Footer />

      </main>
    </div>
  );
};

export default Home;