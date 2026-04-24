import React from 'react';
import { Camera, Image, FlipHorizontal } from 'lucide-react';
import { VISUAL_PRESETS } from '../types';

interface ControlBarProps {
  onCapture: () => void;
  onCycleStyle: () => void;
  onOpenSettings: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  currentPresetIndex: number;
  onSelectPreset: (index: number) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  onCapture, 
  onSelectPreset,
  onOpenSettings,
  currentPresetIndex
}) => {
  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-10 w-full max-w-lg px-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* VINTAGE STYLE SELECTOR */}
      <div className="flex items-center gap-4 overflow-x-auto py-3 no-scrollbar px-6 bg-white/40 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
        {VISUAL_PRESETS.map((preset, idx) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(idx)}
            className={`
              flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all duration-300
              ${currentPresetIndex === idx 
                ? 'bg-[#c08a5d] text-white shadow-md scale-110' 
                : 'bg-white/50 text-[#6f4e37]/60 hover:text-[#6f4e37] hover:bg-white'}
            `}
            title={preset.name}
          >
            {preset.icon}
          </button>
        ))}
      </div>

      {/* SYMMETRICAL CONTROLS */}
      <div className="flex items-center justify-between w-full max-w-md px-4">
        <button 
          onClick={() => {/* gallery logic */}}
          className="w-14 h-14 flex items-center justify-center bg-white/60 border border-white/40 rounded-full text-[#6f4e37] hover:bg-[#c08a5d] hover:text-white transition-all shadow-sm active:scale-90"
        >
          <Image className="w-6 h-6 stroke-[1.5]" />
        </button>

        <div className="relative group">
           {/* Shutter Halo */}
           <div className="absolute inset-[-10px] bg-[#c08a5d]/10 rounded-full blur-xl group-hover:bg-[#c08a5d]/20 transition-all" />
           
           <button 
             onClick={onCapture}
             className="relative w-28 h-28 bg-[#f5f5f5] border-[1px] border-[#6f4e37]/10 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
           >
             <div className="w-22 h-22 rounded-full bg-white border border-[#6f4e37]/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                <Camera className="w-10 h-10 text-[#6f4e37] opacity-60" />
             </div>
           </button>
        </div>

        <button 
          onClick={onOpenSettings}
          className="w-14 h-14 flex items-center justify-center bg-white/60 border border-white/40 rounded-full text-[#6f4e37] hover:bg-[#c08a5d] hover:text-white transition-all shadow-sm active:scale-90"
        >
          <FlipHorizontal className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
};
