import React from 'react';
import { X, Smile, PenTool, Hash, Calendar, Frame, Sparkles } from 'lucide-react';
import { AsciiOptions, Sticker } from '../types';

interface CreativeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
}

const STICKERS = ['💖', '✨', '⭐', '🎀', '🌸', '🦋', '🎈', '🍰', '🍭', '🌈', '🍓', '🐾'];

export const CreativeSheet: React.FC<CreativeSheetProps> = ({ isOpen, onClose, options, setOptions }) => {
  if (!isOpen) return null;

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: 0.5, // Center
      y: 0.5,
      size: 1, // Base scale
      rotation: 0
    };
    setOptions(prev => ({
      ...prev,
      stickers: [...(prev.stickers || []), newSticker]
    }));
  };

  const toggleOverlay = (key: 'showDateStamp' | 'showFilmBorder') => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-3xl rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_-20px_100px_rgba(0,0,0,0.2)] p-8 animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
        {/* Handle for mobile */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full sm:hidden" />

        <div className="flex justify-between items-center mb-10 mt-2">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-pink-400 tracking-[0.3em] mb-1">Art Studio</span>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Creative Options</h3>
           </div>
           <button 
             onClick={onClose}
             className="p-4 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="space-y-12">
           {/* Overlays Toggle */}
           <section>
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-6">Overlays</h4>
              <div className="flex gap-4">
                 <button 
                   onClick={() => toggleOverlay('showDateStamp')}
                   className={`flex-1 p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${options.showDateStamp ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                 >
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Date Stamp</span>
                 </button>
                 <button 
                   onClick={() => toggleOverlay('showFilmBorder')}
                   className={`flex-1 p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${options.showFilmBorder ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                 >
                    <Frame className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Film Border</span>
                 </button>
              </div>
           </section>

           {/* Sticker Tray */}
           <section>
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Sticker Tray</h4>
                 <span className="text-[8px] font-bold text-pink-300 uppercase tracking-widest">Tap to place</span>
              </div>
              <div className="grid grid-cols-6 gap-4">
                 {STICKERS.map(s => (
                   <button 
                     key={s}
                     onClick={() => addSticker(s)}
                     className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl hover:bg-pink-50 hover:border-pink-100 transition-all hover:scale-110 active:scale-95"
                   >
                     {s}
                   </button>
                 ))}
              </div>
           </section>

           {/* Export Mode */}
           <section>
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-6">Capture Mode</h4>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                 <button 
                    onClick={() => setOptions(prev => ({ ...prev, captureMode: 'photo' }))}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${options.captureMode === 'photo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                 >
                    Standard Photo
                 </button>
                 <button 
                    onClick={() => setOptions(prev => ({ ...prev, captureMode: 'gif' }))}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${options.captureMode === 'gif' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                 >
                    Boomerang <Sparkles className="w-3 h-3 text-pink-400" />
                 </button>
              </div>
           </section>
        </div>

        <div className="mt-12 py-8 border-t border-slate-50 text-center">
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Artistry Tools v1.0</p>
        </div>
      </div>
    </div>
  );
};
