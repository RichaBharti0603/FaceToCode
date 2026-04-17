import React from 'react';
import { Terminal, Zap, Camera, ShieldCheck } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, isLoading, error }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-green-500 font-mono overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#00FF41_0%,_transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center gap-12">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-2">
          <Terminal className="w-16 h-16 mb-4 animate-pulse" />
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-2">
            FaceToCode
          </h1>
          <p className="text-xs tracking-[0.6em] opacity-40 uppercase">Neural ASCII Visualization Protocol</p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-6 w-full items-center">
          {error && (
            <div className="text-red-500 text-[10px] bg-red-900/20 border border-red-500/50 px-4 py-2 rounded mb-2">
              CRITICAL FAIL: {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative group px-16 py-6 bg-white text-black font-black uppercase tracking-widest text-xl transition-all
              ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]'}
            `}
          >
            {isLoading ? 'Synchronizing...' : 'Initialize'}
          </button>
          
          <div className="flex items-center gap-2 text-[8px] opacity-20 uppercase tracking-[0.3em]">
             <span>Authorized Personal Use Only // v2.5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
