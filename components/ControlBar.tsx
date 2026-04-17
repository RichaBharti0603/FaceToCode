import React from 'react';
import { Camera, Share2, Sparkles, Sliders } from 'lucide-react';
import { VISUAL_PRESETS } from '../types';

interface ControlBarProps {
  onCapture: () => void;
  onShare: () => void;
  onCycleStyle: () => void;
  onOpenSettings: () => void;
  isSharing: boolean;
  currentPresetName: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  onCapture, 
  onShare, 
  onCycleStyle, 
  onOpenSettings,
  isSharing,
  currentPresetName
}) => {
  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
      
      {/* Style Cycler */}
      <button 
        onClick={onCycleStyle}
        className="flex items-center gap-2 px-5 py-3 hover:bg-white/30 rounded-full transition-all text-slate-900 group"
      >
        <Sparkles className="w-5 h-5 text-pink-400" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-700">
          {currentPresetName}
        </span>
      </button>

      {/* Primary Capture */}
      <button 
        onClick={onCapture}
        className="relative group p-6 bg-slate-900 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
        title="Take Aesthetic Snapshot"
      >
        <Camera className="w-8 h-8" />
        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-10 pointer-events-none" />
      </button>

      {/* Quick Share */}
      <button 
        onClick={onShare}
        disabled={isSharing}
        className={`p-4 rounded-full transition-all ${isSharing ? 'text-pink-400 animate-pulse' : 'text-slate-600 hover:bg-white/30'}`}
        title="Share Magic"
      >
        <Share2 className={`w-5 h-5 ${isSharing ? 'animate-bounce' : ''}`} />
      </button>

      <div className="w-[1px] h-6 bg-slate-200 mx-1" />

      {/* Advanced Settings */}
      <button 
        onClick={onOpenSettings}
        className="p-4 text-slate-400 hover:text-slate-900 hover:bg-white/30 rounded-full transition-all"
        title="Settings"
      >
        <Sliders className="w-5 h-5" />
      </button>
    </div>
  );
};
