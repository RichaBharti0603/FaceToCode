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

      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center gap-8">
        {/* Title Group */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 border border-green-500 rounded-full mb-4 shadow-[0_0_30px_rgba(0,255,65,0.3)]">
            <Terminal className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
            FaceToCode<span className="text-sm align-top ml-1 text-white opacity-50">PRO</span>
          </h1>
          <p className="text-xs tracking-[0.4em] opacity-70 uppercase">Neural ASCII Mapping Interface</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
          <div className="border border-green-900/50 p-4 bg-green-900/10 rounded backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2 text-white">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-bold uppercase">Real-time Rendering</span>
            </div>
            <p className="text-[10px] opacity-60 leading-relaxed">High-performance canvas-based ASCII engine with custom temporal smoothing pipeline.</p>
          </div>
          <div className="border border-green-900/50 p-4 bg-green-900/10 rounded backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2 text-white">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-bold uppercase">Privacy Locked</span>
            </div>
            <p className="text-[10px] opacity-60 leading-relaxed">Processing remains on-device. Neural analysis data is encrypted and discarded after use.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-4 w-full items-center">
          {error && (
            <div className="text-red-500 text-[10px] bg-red-900/20 border border-red-500/50 px-4 py-2 rounded mb-2">
              CRITICAL ERROR: {error}
            </div>
          )}
          
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              relative group px-12 py-4 bg-green-500 text-black font-black uppercase tracking-widest text-lg transition-all
              ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(0,255,65,0.5)]'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 animate-pulse text-sm">
                SYNCHRONIZING NEURAL LINK...
              </span>
            ) : (
              'Initialize System'
            )}
          </button>
          
          <div className="flex items-center gap-2 text-[10px] opacity-40 uppercase">
             <Camera className="w-3 h-3" />
             <span>Webcam Access Required for Visualization</span>
          </div>
        </div>
      </div>

      {/* Footer System Log */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between text-[8px] opacity-30 font-mono tracking-widest">
        <div>V2.0.4 BUILD_STABLE</div>
        <div>LATENCY: 0.12ms</div>
        <div>ENCRYPTION: AES-256</div>
      </div>
    </div>
  );
};
