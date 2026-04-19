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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-4 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-full shadow-[0_30px_100px_rgba(244,63,94,0.08)]">
      
      {/* Style Cycler */}
      <button 
        onClick={onCycleStyle}
        className="flex items-center gap-4 px-8 py-5 hover:bg-white/50 rounded-full transition-all text-slate-900 group"
      >
        <Sparkles className="w-5 h-5 text-rose-300 fill-rose-100 group-hover:rotate-12 transition-transform" />
        <div className="flex flex-col items-start leading-none gap-0.5">
           <span className="text-[8px] uppercase font-bold text-rose-300 tracking-[0.4em] lowercase">aesthetic</span>
           <span className="text-[11px] font-black tracking-tighter text-slate-800 lowercase">
             {currentPresetName}
           </span>
        </div>
      </button>
 
      {/* Primary Capture */}
      <div className="relative group">
         <div className="absolute inset-[-8px] bg-rose-200/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
         <button 
           onClick={onCapture}
           className="relative z-10 px-10 py-5 bg-slate-900 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-4"
           title="Capture Magic"
         >
           <Camera className="w-6 h-6" />
           <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">capture magic ✨</span>
         </button>
      </div>
 
      {/* Record Toggle */}
      <button 
        onClick={onToggleRecording}
        className={`flex items-center gap-4 px-8 py-5 rounded-full transition-all ${isRecording ? 'bg-rose-50 text-rose-500' : 'hover:bg-white/50 text-slate-500'}`}
        title="Record Session"
      >
         <Circle className={`w-5 h-5 ${isRecording ? 'fill-rose-500 animate-pulse' : ''}`} />
         <div className="flex flex-col items-start leading-none gap-0.5">
           <span className="text-[8px] uppercase font-bold text-slate-300 tracking-[0.4em] lowercase">capture</span>
           <span className="text-[11px] font-black tracking-tighter lowercase">
             {isRecording ? 'live' : 'loop'}
           </span>
        </div>
      </button>
 
      <div className="w-[1px] h-10 bg-slate-200/30 mx-2" />
 
      {/* Advanced Settings */}
      <button 
        onClick={onOpenSettings}
        className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-full transition-all"
        title="Settings"
      >
        <Sliders className="w-5 h-5" />
      </button>
    </div>
  );
};
