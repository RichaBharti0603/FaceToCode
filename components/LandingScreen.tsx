import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Palette, Save, Github, Play, CheckCircle2, Circle } from 'lucide-react';

import logoImg from '../assests/images/logo.png';
import heroImg from '../assests/images/hero.jpg';


export const LandingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [frame, setFrame] = useState(0);

  // Animated ASCII Preview
  const asciiFrames = [
    "@@@@@@@@@@@@@@@@@\n@               @\n@     @@@@@     @\n@               @\n@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@\n@               @\n@    @%@@%@     @\n@               @\n@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@\n@               @\n@   @@@O@@@@    @\n@               @\n@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@\n@               @\n@     @@@@@     @\n@               @\n@@@@@@@@@@@@@@@@@"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % asciiFrames.length);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary font-sans flex flex-col overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="h-[80px] px-6 lg:px-12 flex items-center justify-between border-b border-border bg-bg-main/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="FaceToCode Logo" className="h-[36px] md:h-[44px] w-auto drop-shadow-md" />
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-mono text-sm">
          <a href="#features" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">Features</a>
          <a href="#how-it-works" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">How it Works</a>
          <Link to="/gallery" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">Gallery</Link>
          <Link to="/about" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">About</Link>
        </div>

        <div className="flex items-center">
          <a href="https://github.com/RichaBharti0603/FaceToCode" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:text-accent hover:drop-shadow-[0_0_8px_var(--accent)] hover:-translate-y-[1px] transition-all">
            <span className="font-mono text-sm hidden sm:inline">GitHub</span>
            <Github size={24} />
          </a>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-between px-6 lg:px-12 py-10 md:py-0 gap-10 md:gap-16 max-w-7xl mx-auto w-full flex-hero min-h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Side: Text & CTA */}
        <div className="flex-1 flex flex-col items-start gap-6 animate-slide-up order-2 md:order-1">
          <div className="flex flex-wrap gap-3">
            <span className="bg-[#1a1a1a] rounded-full px-3 py-1 text-xs font-mono flex items-center gap-2">
              <span className="text-warning">⚡</span> &lt;30ms
            </span>
            <span className="bg-[#1a1a1a] rounded-full px-3 py-1 text-xs font-mono flex items-center gap-2">
              <span className="text-primary">🎨</span> 16 levels
            </span>
            <span className="bg-[#1a1a1a] rounded-full px-3 py-1 text-xs font-mono flex items-center gap-2">
              <span className="text-success">📸</span> 60fps
            </span>
          </div>

          <h1 className="text-[52px] font-extrabold tracking-tight leading-[1.1] text-white">
            FaceToCode
          </h1>
          <h2 className="text-xl font-mono text-text-secondary">
            Real-time ASCII Artist
          </h2>
          <p className="text-sm text-primary/70">
            Turn your webcam into a 1980s terminal
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <button onClick={() => navigate('/camera')} className="btn-primary flex items-center justify-center gap-2">
              <Play size={16} fill="currentColor" /> START CONVERTING
            </button>
            <button onClick={() => navigate('/about')} className="btn-secondary flex items-center justify-center gap-2">
              ▼ WATCH DEMO
            </button>
          </div>
        </div>

        {/* Right Side: Hero Image */}
        <div className="w-full md:w-[45%] relative order-1 md:order-2 group hero-content flex items-center justify-center">
          <div className="relative rounded-[16px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-h-[80vh] flex items-center">
            <img src={heroImg} alt="Hero" className="w-full h-auto object-cover hero-image" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(199,167,93,0.2),transparent_70%)] mix-blend-screen pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="features" className="py-20 bg-bg-surface px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Core Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-card-hover group">
              <div className="w-10 h-10 mb-4 text-primary mx-auto flex items-center justify-center">
                <Camera size={40} />
              </div>
              <h4 className="text-[18px] font-bold text-center mb-4 border-b border-[#222] pb-4 group-hover:border-primary/30 transition-colors">REAL-TIME PROCESSING</h4>
              <p className="text-[14px] text-[#aaa] text-center mb-6">
                Direct WebRTC camera feed to ASCII canvas with zero latency. Fully client-side processing.
              </p>
              <div className="text-center">
                <Link to="/about" className="text-sm text-primary hover:underline font-mono">Learn more →</Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-card-hover group">
              <div className="w-10 h-10 mb-4 text-primary mx-auto flex items-center justify-center">
                <Palette size={40} />
              </div>
              <h4 className="text-[18px] font-bold text-center mb-4 border-b border-[#222] pb-4 group-hover:border-primary/30 transition-colors">CUSTOM CHARSETS</h4>
              <p className="text-[14px] text-[#aaa] text-center mb-6">
                Map brightness levels to any custom character set. From classic ASCII to dense block elements.
              </p>
              <div className="text-center">
                <Link to="/settings" className="text-sm text-primary hover:underline font-mono">Learn more →</Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-card-hover group">
              <div className="w-10 h-10 mb-4 text-primary mx-auto flex items-center justify-center">
                <Save size={40} />
              </div>
              <h4 className="text-[18px] font-bold text-center mb-4 border-b border-[#222] pb-4 group-hover:border-primary/30 transition-colors">SAVE & SHARE</h4>
              <p className="text-[14px] text-[#aaa] text-center mb-6">
                Capture high-resolution PNGs, copy raw text, or record short terminal-style GIFs.
              </p>
              <div className="text-center">
                <Link to="/gallery" className="text-sm text-primary hover:underline font-mono">Learn more →</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col items-center">
        <h3 className="text-3xl font-bold mb-16 text-center">How It Works</h3>
        
        {/* Stepper Visual */}
        <div className="flex items-center w-full max-w-4xl mb-12 relative">
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#444] -z-10 -translate-y-1/2" />
          <div className="absolute top-1/2 left-0 w-[50%] h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-1000" />

          {/* Steps */}
          {[
            { id: 1, label: 'Allow Camera', status: 'completed' },
            { id: 2, label: 'Frame Capture', status: 'completed' },
            { id: 3, label: 'Charset Mapping', status: 'active' },
            { id: 4, label: 'ASCII Output', status: 'pending' },
          ].map((step, idx) => (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              <div className="bg-bg-main p-2">
                {step.status === 'completed' && <CheckCircle2 size={24} className="text-primary fill-bg-main" />}
                {step.status === 'active' && <Circle size={24} className="text-primary animate-pulse-glow fill-primary/20" />}
                {step.status === 'pending' && <Circle size={24} className="text-[#444]" />}
              </div>
              <div className="absolute top-12 text-center w-[120px]">
                <div className="text-xs font-bold text-text-primary mb-1">Step {step.id}</div>
                <div className="text-[11px] text-text-secondary">{step.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Cards Detail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-12">
           {[
            { id: 1, title: "Access", desc: "Request standard WebRTC stream" },
            { id: 2, title: "Process", desc: "Extract pixel brightness" },
            { id: 3, title: "Map", desc: "Assign ASCII chars to density" },
            { id: 4, title: "Render", desc: "Draw to <pre> output" },
           ].map(card => (
             <div key={card.id} className="bg-[#111] p-4 rounded-xl border border-[#222] text-center w-full">
               <div className="text-sm font-bold mb-2">[{card.id}] {card.title}</div>
               <div className="text-xs text-[#aaa]">{card.desc}</div>
             </div>
           ))}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="relative bg-gradient-to-b from-bg-main to-[#060d18] pt-16 pb-8 border-t border-border overflow-hidden">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-screen bg-[url('/assests/images/download.png')] bg-cover bg-center"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Logo Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                 <img src={logoImg} alt="FaceToCode" className="h-8 drop-shadow-md" />
                 <span className="font-mono font-bold text-xl text-primary tracking-tight">FaceToCode</span>
              </div>
              <p className="text-text-secondary text-sm max-w-md leading-relaxed mb-6">
                Turn your webcam into a 1980s terminal with real-time ASCII conversion. A premium artistic utility built for the web.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-ui font-bold mb-4">Product</h4>
              <ul className="space-y-3 font-mono text-sm">
                <li><Link to="/camera" className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2"><span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">▸</span> Camera</Link></li>
                <li><Link to="/gallery" className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2"><span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">▸</span> Gallery</Link></li>
                <li><Link to="/settings" className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2"><span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">▸</span> Settings</Link></li>
              </ul>
            </div>

            {/* Connect Links */}
            <div>
              <h4 className="text-white font-ui font-bold mb-4">Connect</h4>
              <ul className="space-y-3 font-mono text-sm">
                <li><Link to="/about" className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2">About & FAQ</Link></li>
                <li><a href="https://github.com/RichaBharti0603/FaceToCode" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2">GitHub</a></li>
                <li><a href="mailto:hello@facetocode.com" className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2">Contact</a></li>
              </ul>
              
              <div className="flex items-center gap-4 mt-6">
                <a href="https://github.com/RichaBharti0603/FaceToCode" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-accent transition-colors">
                  <Github size={20} />
                </a>
              </div>
            </div>
            
          </div>
          
          {/* Divider with Glow */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between font-mono text-xs text-text-muted">
            <p>© 2026 FaceToCode. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built with <span className="text-error mx-1">❤️</span> by Antigravity</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

