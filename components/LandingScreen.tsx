import React from 'react';
import { Camera, Heart, Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, isLoading, error }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-slate-800 font-sans overflow-hidden">
      {/* Premium Cinematic Background */}
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,_#FFF1F2_0%,_transparent_40%),radial-gradient(circle_at_80%_80%,_#F5F3FF_0%,_transparent_40%)]" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:32px_32px]"></div>
      
      {/* Animated Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-100/50 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="relative z-10 flex flex-col items-center max-w-3xl text-center gap-20">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="relative group cursor-pointer">
             <div className="absolute inset-0 bg-pink-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
             <Heart className="w-20 h-20 text-pink-400 fill-pink-50 animate-[bounce_2s_infinite]" />
             <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-slate-900 leading-none mb-4">
              facetocode<span className="text-pink-400">.</span>
            </h1>
            <p className="text-xs md:text-sm tracking-[0.4em] text-slate-400 uppercase font-black px-4">
               The Boutique <span className="text-pink-300">Aesthetic</span> ASCII Photobooth
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-10 w-full items-center animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
          {error && (
            <div className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-8 py-3 rounded-full border border-red-100 mb-4 animate-bounce">
              System Recall: {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative group px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] transition-all
              ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:bg-slate-800'}
            `}
          >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                  <Camera className="w-8 h-8 text-white" />
               </div>
               <div className="flex flex-col items-start pr-4">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1 group-hover:text-pink-200">Initiate Sequence</span>
                  <span className="text-2xl font-black tracking-tight">{isLoading ? 'Syncing...' : 'Start Camera'}</span>
               </div>
            </div>
          </button>
          
          <div className="flex flex-col items-center gap-6 opacity-30">
             <div className="h-[100px] w-[1px] bg-gradient-to-b from-slate-900 to-transparent" />
             <div className="flex items-center gap-6 text-[10px] text-slate-900 uppercase font-black tracking-[0.5em]">
                <span>Art</span>
                <span className="text-pink-500">•</span>
                <span>Code</span>
                <span className="text-pink-500">•</span>
                <span>Aesthetic</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="absolute bottom-12 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
         © 2024 FaceToCode // All Rights Visualized
      </footer>
    </div>
  );
};

