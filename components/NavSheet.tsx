import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Grid, Sparkles, X, ChevronRight } from 'lucide-react';

interface NavSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavSheet: React.FC<NavSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#f5e9dc]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-3xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl p-10 animate-in slide-in-from-bottom-full duration-500">
        <div className="flex justify-between items-center mb-12">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#6f4e37]/40 tracking-[0.2em] mb-1">courtyard</span>
              <h3 className="text-3xl font-serif font-bold text-[#6f4e37]">Navigate</h3>
           </div>
           <button 
             onClick={onClose}
             className="w-10 h-10 flex items-center justify-center bg-[#f5e9dc]/50 rounded-full text-[#6f4e37]/40 hover:text-[#c08a5d] transition-colors"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        <nav className="flex flex-col gap-4">
           <Link 
             to="/my" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-[#f5e9dc]/30 border border-transparent rounded-[32px] hover:bg-white hover:border-[#e6b98c] transition-all shadow-sm"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center group-hover:bg-[#f5e9dc] transition-colors">
                    <Grid className="w-5 h-5 text-[#c08a5d]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-base font-semibold text-[#6f4e37]">My Gallery ✨</span>
                    <span className="text-[10px] text-[#6f4e37]/40 italic">heritage archive</span>
                 </div>
              </div>
           </Link>

           <Link 
             to="/explore" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-[#f5e9dc]/30 border border-transparent rounded-[32px] hover:bg-white hover:border-[#e6b98c] transition-all shadow-sm"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center group-hover:bg-[#f5e9dc] transition-colors">
                    <Sparkles className="w-5 h-5 text-[#c08a5d]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-base font-semibold text-[#6f4e37]">Explore Art ☁️</span>
                    <span className="text-[10px] text-[#6f4e37]/40 italic">royal fragments</span>
                 </div>
              </div>
           </Link>

           <Link 
             to="/" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-[#6f4e37] text-white rounded-[32px] hover:bg-[#8b5e3c] transition-all shadow-lg"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-base font-semibold">Camera 💌</span>
                    <span className="text-[10px] opacity-60 italic">return to lens</span>
                 </div>
              </div>
           </Link>
        </nav>

        <div className="mt-12 pt-8 border-t border-[#f5e9dc] flex justify-center text-[10px] text-[#6f4e37]/20 uppercase tracking-widest">
           facetocode © 2026
        </div>
      </div>
    </div>
  );
};
