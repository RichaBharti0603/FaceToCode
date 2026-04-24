import React from 'react';
import { Camera, Heart, Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, isLoading, error }) => {
  return (
    <div className="fixed inset-0 z-[100] vintage-bg flex flex-col items-center justify-center p-6 text-[#6f4e37] font-sans overflow-hidden">
      <div className="pattern-overlay" />
      <div className="grain-overlay" />
      
      {/* Heritage Corner Motifs (Optional based on assets) */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none rotate-180">
          <img src="/assests/images/5e21cdc79b7a0fb1e0e2c176be5d5168.jpg" className="w-full h-full object-contain" alt="" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
          <img src="/assests/images/5e21cdc79b7a0fb1e0e2c176be5d5168.jpg" className="w-full h-full object-contain" alt="" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xl text-center gap-10">
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 p-12 bg-white/30 backdrop-blur-sm rounded-[40px] border border-white/40">
          <h1 className="text-7xl md:text-8xl font-serif tracking-[0.2em] text-[#6f4e37] uppercase drop-shadow-sm">
            FACETOCODE.
          </h1>
          <p className="text-sm md:text-base text-[#6f4e37]/60 font-medium tracking-[0.5em] uppercase font-sans">
            Heritage Portrait Engine • Edition II
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full items-center animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
          {error && (
            <div className="text-white text-[10px] font-bold bg-[#c08a5d]/80 backdrop-blur-md px-8 py-3 rounded-full border border-white/30 mb-4 animate-bounce uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative btn-matte-terracotta h-20 px-20 font-bold rounded-full transition-all border border-white/20
              shadow-lg hover:scale-105 active:scale-95
              ${isLoading ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            <span className="text-xl tracking-[0.3em] uppercase font-serif">
                {isLoading ? 'Awakening...' : 'Begin Experience'}
            </span>
          </button>
        </div>
      </div>

      <footer className="absolute bottom-12 text-[10px] text-[#6f4e37]/40 font-bold tracking-[0.5em] uppercase font-serif italic">
         FACETOCODE. STUDIO • HERITAGE DIGITAL FRAGMENTS
      </footer>
    </div>
  );
};

