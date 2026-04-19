import React from 'react';
import { Camera, Heart, Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, isLoading, error }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#fff1f5] via-[#fce7f3] to-[#fff7ed] flex flex-col items-center justify-center p-6 text-gray-600 font-sans overflow-hidden">
      {/* Animated Floating Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-200/30 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-purple-200/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-rose-100/40 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 flex flex-col items-center max-w-xl text-center gap-12">
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-7xl md:text-8xl font-bold tracking-tight text-gray-900 lowercase">
            FaceToCode ✨
          </h1>
          <p className="text-lg md:text-xl text-pink-400 font-medium lowercase">
            turn your face into art
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full items-center animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
          {error && (
            <div className="text-rose-500 text-xs font-semibold bg-white/60 backdrop-blur-md px-6 py-2 rounded-full border border-rose-100 mb-4 animate-bounce">
              {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative h-20 px-12 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-full transition-all
              shadow-[0_15px_40px_rgba(244,114,182,0.3)] hover:shadow-[0_20px_50px_rgba(244,114,182,0.5)]
              ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95'}
            `}
          >
            <span className="text-xl tracking-tight">
                {isLoading ? 'making magic...' : 'Start Camera 💖'}
            </span>
          </button>
        </div>
      </div>

      <footer className="absolute bottom-12 text-[10px] text-gray-400 font-medium tracking-[0.2em] lowercase opacity-60">
         facetocode. studio • aesthetic fragments
      </footer>
    </div>
  );
};

