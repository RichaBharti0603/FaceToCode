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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-8 w-full max-w-md px-6">
      
      {/* 7. FILTER SYSTEM (AESTHETIC SCROLLER) */}
      <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar mask-fade-edges">
        {VISUAL_PRESETS.map((preset, idx) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(idx)}
            className={`
              flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300
              ${currentPresetIndex === idx 
                ? 'bg-pink-400 text-white shadow-[0_10px_25px_rgba(244,114,182,0.4)] scale-110' 
                : 'bg-white/60 backdrop-blur-xl border border-white/60 text-gray-500 hover:bg-white'}
            `}
            title={preset.name}
          >
            {preset.icon}
          </button>
        ))}
      </div>

      {/* 5. SHUTTER BUTTON (MAIN FOCUS) */}
      <div className="flex items-center gap-12">
        <button 
          onClick={() => {/* gallery logic */}}
          className="w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-gray-400 hover:text-pink-400 transition-all"
        >
          <Image className="w-5 h-5" />
        </button>

        <div className="relative">
           <div className="absolute inset-[-12px] bg-pink-200/20 rounded-full blur-2xl animate-pulse" />
           <button 
             onClick={onCapture}
             className="relative w-[76px] h-[76px] bg-white rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1),inset_0_0_0_4px_white,inset_0_0_0_6px_rgba(0,0,0,0.05)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
           >
             <div className="w-[60px] h-[60px] rounded-full border border-gray-100 group-hover:bg-pink-50 transition-all" />
           </button>
        </div>

        <button 
          onClick={onOpenSettings}
          className="w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-gray-400 hover:text-pink-400 transition-all"
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
