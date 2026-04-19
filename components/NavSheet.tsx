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
        className="absolute inset-0 bg-pink-100/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-3xl rounded-t-[40px] sm:rounded-[40px] shadow-[0_30px_100px_rgba(244,114,182,0.15)] p-10 animate-in slide-in-from-bottom-full duration-500">
        <div className="flex justify-between items-center mb-12">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1 lowercase">menu</span>
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 lowercase">Explore</h3>
           </div>
           <button 
             onClick={onClose}
             className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-pink-400 transition-colors"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        <nav className="flex flex-col gap-4">
           <Link 
             to="/my" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-gray-50/50 border border-transparent rounded-[32px] hover:bg-white hover:border-pink-100 transition-all shadow-sm hover:shadow-md"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Grid className="w-5 h-5 text-pink-400" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-base font-semibold text-gray-900 lowercase">My Gallery ✨</span>
                    <span className="text-[10px] text-gray-400 lowercase italic">your aesthetic archive</span>
                 </div>
              </div>
           </Link>

           <Link 
             to="/explore" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-gray-50/50 border border-transparent rounded-[32px] hover:bg-white hover:border-pink-100 transition-all shadow-sm hover:shadow-md"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-base font-semibold text-gray-900 lowercase">Explore Art ☁️</span>
                    <span className="text-[10px] text-gray-400 lowercase italic">modern fragments</span>
                 </div>
              </div>
           </Link>

           <Link 
             to="/" 
             onClick={onClose}
             className="group flex items-center justify-between p-6 bg-pink-400 text-white rounded-[32px] hover:bg-pink-500 transition-all shadow-lg shadow-pink-200/50"
           >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-base font-semibold lowercase">Camera 💌</span>
                    <span className="text-[10px] opacity-60 lowercase italic">back to magic</span>
                 </div>
              </div>
           </Link>
        </nav>

        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-center text-[10px] text-gray-300 transition-opacity lowercase opacity-60">
           facetocode © 2024
        </div>
      </div>
    </div>
  );
};
