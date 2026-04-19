import React from 'react';
import { Camera, Heart, Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, isLoading, error }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-soft-pink flex flex-col items-center justify-center p-6 text-slate-800 font-sans overflow-hidden">
      {/* Animated Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-200/40 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-[120px] animate-blob delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full grain-overlay opacity-5" />

      <div className="relative z-10 flex flex-col items-center max-w-3xl text-center gap-16">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="relative group">
             <div className="absolute inset-0 bg-pink-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
             <Heart className="w-16 h-16 text-rose-300 fill-rose-50 animate-[bounce_3s_infinite]" />
             <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-rose-200 animate-pulse" />
          </div>
          <div>
            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-slate-900 leading-none mb-2 lowercase">
              facetocode.
            </h1>
            <p className="text-xs md:text-sm tracking-[0.5em] text-slate-400 uppercase font-bold px-4">
               turn your beauty into <span className="text-rose-300">code</span> ✨
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-10 w-full items-center animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
          {error && (
            <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-50 px-8 py-3 rounded-full border border-rose-100 mb-4 animate-bounce">
              {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative group h-28 px-12 bg-white/40 backdrop-blur-2xl border border-white/60 text-slate-900 rounded-full transition-all
              ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 hover:shadow-[0_40px_100px_rgba(244,63,94,0.1)] hover:bg-white'}
            `}
          >
            <div className="flex items-center gap-8">
               <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-white" />
               </div>
               <div className="flex flex-col items-start pr-4">
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-400 mb-0.5 lowercase">make it cute</span>
                  <span className="text-2xl font-black tracking-tight uppercase">{isLoading ? 'making magic...' : 'capture magic ✨'}</span>
               </div>
            </div>
          </button>
          
          <div className="flex flex-col items-center gap-8 opacity-20">
             <div className="flex items-center gap-10 text-[10px] text-slate-900 uppercase font-black tracking-[0.5em]">
                <span>dreamy</span>
                <div className="w-1 h-1 rounded-full bg-rose-400" />
                <span>aesthetic</span>
                <div className="w-1 h-1 rounded-full bg-rose-400" />
                <span>yours</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="absolute bottom-12 text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em] lowercase">
         facetocode. studio • aesthetic fragments
      </footer>
    </div>
  );
};

