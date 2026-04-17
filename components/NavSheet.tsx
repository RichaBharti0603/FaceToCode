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
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-3xl rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_-20px_100px_rgba(0,0,0,0.1)] p-8 animate-in slide-in-from-bottom-full duration-500">
        <div className="flex justify-between items-center mb-10">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-pink-400 tracking-[0.3em] mb-1">Navigation</span>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Explore Space</h3>
           </div>
           <button 
             onClick={onClose}
             className="p-4 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        <nav className="flex flex-col gap-3">
           <Link 
             to="/my" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-pink-200 transition-all hover:shadow-[0_10px_30px_rgba(253,178,202,0.1)]"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Grid className="w-5 h-5 text-pink-500" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">My Gallery 🖼️</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your personal archive</span>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-pink-300 group-hover:translate-x-1 transition-all" />
           </Link>

           <Link 
             to="/explore" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-pink-200 transition-all hover:shadow-[0_10px_30px_rgba(253,178,202,0.1)]"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">Explore ✨</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Community captures</span>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-pink-300 group-hover:translate-x-1 transition-all" />
           </Link>

           <Link 
             to="/" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black">Camera 📸</span>
                    <span className="text-[10px] uppercase font-bold opacity-40 tracking-wider">Back to capturing magic</span>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-20" />
           </Link>
        </nav>

        <div className="mt-10 pt-8 border-t border-slate-50 flex justify-center text-[8px] uppercase font-bold tracking-[0.4em] text-slate-300">
           facetocode © 2024
        </div>
      </div>
    </div>
  );
};
