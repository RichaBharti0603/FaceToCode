import React from 'react';
import { Palette, Sparkles, Film, Image as ImageIcon, Smile, PenTool } from 'lucide-react';
import { AestheticFilter, AsciiOptions } from '../types';

interface CreativeToolbarProps {
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
  onOpenCreativeSheet: () => void;
}

const FILTERS: { id: AestheticFilter; name: string; icon: string }[] = [
  { id: 'none', name: 'None', icon: '∅' },
  { id: 'vintage', name: 'Vintage', icon: '🎞️' },
  { id: 'soft_pink', name: 'Blush', icon: '🌸' },
  { id: 'cool_blue', name: 'Icy', icon: '🧊' },
  { id: 'dreamy', name: 'Glow', icon: '☁️' },
  { id: 'noir', name: 'Noir', icon: '🌑' },
];

export const CreativeToolbar: React.FC<CreativeToolbarProps> = ({ options, setOptions, onOpenCreativeSheet }) => {
  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Quick Filters Scroll */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setOptions(prev => ({ ...prev, filter: filter.id }))}
            className={`
              flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all
              ${options.filter === filter.id 
                ? 'bg-pink-500 text-white shadow-lg scale-105' 
                : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-white'}
            `}
          >
            <span className="text-lg">{filter.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Creative Shortcuts */}
      <div className="flex justify-center gap-4">
         <button 
           onClick={onOpenCreativeSheet}
           className="px-6 py-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full shadow-lg flex items-center gap-3 hover:scale-105 transition-all text-slate-900 group"
         >
            <div className="flex items-center gap-1">
               <Smile className="w-4 h-4 text-pink-500 group-hover:rotate-12 transition-transform" />
               <PenTool className="w-4 h-4 text-purple-500 group-hover:-rotate-12 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Creative Tools</span>
         </button>
      </div>
    </div>
  );
};
