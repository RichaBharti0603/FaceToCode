import React from 'react';
import { Camera, Terminal, Heart, Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, isLoading, error }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-slate-800 font-sans overflow-hidden">
      {/* Aesthetic Background */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_#FFD1DC_0%,_transparent_50%),radial-gradient(circle_at_bottom_left,_#E6E6FA_0%,_transparent_50%)] animate-pulse" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center gap-16">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <Heart className="w-16 h-16 text-pink-400 animate-bounce" />
             <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-7xl font-light tracking-tight text-slate-900 mb-2">
            facetocode<span className="text-pink-400 font-black">.</span>
          </h1>
          <p className="text-sm tracking-[0.2em] text-slate-400 uppercase font-medium">Your Aesthetic ASCII Photobooth</p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-8 w-full items-center">
          {error && (
            <div className="text-red-400 text-xs bg-red-50 px-4 py-2 rounded-full border border-red-100 mb-2">
              System Recall: {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative group px-20 py-6 bg-slate-900 text-white font-bold uppercase tracking-widest text-lg rounded-full transition-all
              ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:bg-pink-500'}
            `}
          >
            {isLoading ? 'Loading Magic...' : 'Start Camera'}
          </button>
          
          <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
             <div className="w-8 h-[1px] bg-slate-200" />
             <span>Pure Aesthetic // Version 3.0</span>
             <div className="w-8 h-[1px] bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
