import React from 'react';
import { Camera, Circle, Sparkles, Sliders } from 'lucide-react';
import { VISUAL_PRESETS } from '../types';

interface ControlBarProps {
  onCapture: () => void;
  onCycleStyle: () => void;
  onOpenSettings: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  currentPresetName: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  onCapture, 
  onCycleStyle, 
  onOpenSettings,
  onToggleRecording,
  isRecording,
  currentPresetName
}) => {
  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-3 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
      
      {/* Style Cycler */}
      <button 
        onClick={onCycleStyle}
        className="flex items-center gap-3 px-6 py-4 hover:bg-white/50 rounded-full transition-all text-slate-900 group"
      >
        <Sparkles className="w-5 h-5 text-pink-400 fill-pink-100" />
        <div className="flex flex-col items-start leading-none">
           <span className="text-[8px] uppercase font-black text-pink-300 tracking-[0.2em] mb-1">Theme</span>
           <span className="text-[10px] uppercase font-black tracking-widest text-slate-700">
             {currentPresetName}
           </span>
        </div>
      </button>

      {/* Primary Capture */}
      <button 
        onClick={onCapture}
        className="relative group p-8 bg-slate-900 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
        title="Take Aesthetic Snapshot"
      >
        <Camera className="w-8 h-8" />
        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-10 pointer-events-none" />
      </button>

      {/* Record Toggle */}
      <button 
        onClick={onToggleRecording}
        className={`flex items-center gap-3 px-6 py-4 rounded-full transition-all ${isRecording ? 'bg-red-50 text-red-500' : 'hover:bg-white/50 text-slate-500'}`}
        title="Record Session"
      >
         <Circle className={`w-5 h-5 ${isRecording ? 'fill-red-500 animate-pulse' : ''}`} />
         <div className="flex flex-col items-start leading-none">
           <span className="text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">Capture</span>
           <span className="text-[10px] uppercase font-black tracking-widest">
             {isRecording ? 'Live' : 'Video'}
           </span>
        </div>
      </button>

      <div className="w-[1px] h-8 bg-slate-200/50 mx-2" />

      {/* Advanced Settings */}
      <button 
        onClick={onOpenSettings}
        className="p-5 text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-full transition-all"
        title="Settings"
      >
        <Sliders className="w-5 h-5" />
      </button>
    </div>
  );
};
