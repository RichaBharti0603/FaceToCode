import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Palette, Save, Github, Play, CheckCircle2, Circle } from 'lucide-react';

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
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-bg-main font-bold">
            {'<'}
          </div>
          <span className="font-mono font-bold text-primary text-xl tracking-tight">FaceToCode</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-mono text-sm">
          <a href="#features" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">Features</a>
          <a href="#how-it-works" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">How it Works</a>
          <Link to="/gallery" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">Gallery</Link>
          <Link to="/about" className="p-4 hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_var(--primary-glow)]">About</Link>
        </div>

        <div className="flex items-center">
          <a href="https://github.com/facetocode" target="_blank" rel="noreferrer" className="w-6 h-6 hover:scale-105 transition-transform hover:text-primary">
            <Github size={24} />
          </a>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 lg:px-12 py-20 gap-16 max-w-7xl mx-auto w-full">
        
        {/* Left Side: Animated ASCII Preview */}
        <div className="w-full md:w-[400px] h-[300px] bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl relative p-6 shadow-card-hover flex flex-col overflow-hidden group">
          <div className="scanlines-green opacity-50" />
          <pre className="font-mono text-primary text-[24px] leading-tight flex-1 flex items-center justify-center text-center animate-glitch group-hover:animate-none transition-all">
            {asciiFrames[frame]}
          </pre>
          <div className="absolute bottom-4 right-4 text-primary font-mono animate-blink">_</div>
        </div>

        {/* Right Side: Text & CTA */}
        <div className="flex-1 flex flex-col items-start gap-6 animate-slide-up">
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
      <footer className="h-[80px] border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-6 lg:px-12 text-[12px] text-[#666] font-mono w-full">
        <div className="flex-1 text-left">
          © 2026 FaceToCode — <a href="#" className="hover:text-primary">Open source</a>
        </div>
        <div className="flex-1 text-center hidden md:block">
          HTML • CSS • JS • WebRTC
        </div>
        <div className="flex-1 text-right">
          Made with <span className="text-primary">⚡</span> by Antigravity
        </div>
      </footer>
    </div>
  );
};

