import React from 'react';
import { Camera, Share2, Palette, Settings } from 'lucide-react';
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Style Cycler */}
      <button 
        onClick={onCycleStyle}
        className="group relative flex flex-col items-center gap-1 text-white/50 hover:text-green-500 transition-all px-4"
        title="Cycle View Style"
      >
        <Palette className="w-5 h-5" />
        <span className="text-[8px] uppercase font-bold tracking-widest absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {currentPresetName}
        </span>
      </button>

      <div className="w-[1px] h-6 bg-white/10" />

      {/* Primary Capture */}
      <button 
        onClick={onCapture}
        className="relative group p-5 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        title="Capture Neural Snapshot"
      >
        <Camera className="w-8 h-8" />
        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20 pointer-events-none" />
      </button>

      <div className="w-[1px] h-6 bg-white/10" />

      {/* Quick Share */}
      <button 
        onClick={onShare}
        disabled={isSharing}
        className={`group p-4 rounded-full transition-all ${isSharing ? 'text-yellow-500 animate-pulse' : 'text-white/50 hover:text-yellow-400 hover:bg-white/5'}`}
        title="Share Fragment"
      >
        <Share2 className={`w-5 h-5 ${isSharing ? 'animate-bounce' : ''}`} />
      </button>

      <div className="w-[1px] h-6 bg-white/10" />

      {/* Advanced Settings */}
      <button 
        onClick={onOpenSettings}
        className="p-4 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all"
        title="Advanced Protocol Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};
