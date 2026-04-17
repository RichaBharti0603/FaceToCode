import React, { useState } from 'react';
import { Download, Share2, ArrowLeft, Check, Copy, Smartphone } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

interface DeliveryScreenProps {
  souvenir: string;
  onReset: () => void;
  onShare: () => Promise<string | undefined>;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DeliveryScreen: React.FC<DeliveryScreenProps> = ({ souvenir, onReset, onShare, addToast }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMemeEditor, setShowMemeEditor] = useState(false);
  const [memeTop, setMemeTop] = useState('');
  const [memeBottom, setMemeBottom] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = souvenir;
    link.download = `facetocode-${Date.now()}.png`;
    link.click();
    addToast("Saved to your device ✨", "success");
    trackEvent('souvenir_downloaded');
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const url = await onShare();
      if (url) {
        setShareUrl(`${window.location.origin}/s/${url}`);
        trackEvent('souvenir_link_generated');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({
          title: 'My Aesthetic ASCII Portrait',
          text: 'Captured at FaceToCode ✨',
          url: shareUrl
        });
      } catch (err) {
        console.error("Native share failed:", err);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Souvenir Preview */}
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="p-4 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.08)] rounded-[2.5rem] border border-pink-100 rotate-[-1.5deg] max-h-[70vh] overflow-hidden">
              <img src={souvenir} className="w-full h-auto rounded-[2rem]" alt="Your Souvenir" />
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-6">
           <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">Aesthetic Fragment<span className="text-pink-400">.</span></h2>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em]">Captured at FaceToCode Studio.</p>
           </div>

           {/* Viral Toolbar */}
           <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-3xl border border-slate-100">
              <button 
                onClick={() => {
                   const captions = [
                     "I turned my face into code 💻✨",
                     "Pure data energy 🌊",
                     "POV: you are a dataset",
                     "This feels illegal but I love it 😭",
                     "Aesthetic code fragments ✨"
                   ];
                   addToast(captions[Math.floor(Math.random() * captions.length)], "info");
                }}
                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-pink-300 hover:text-pink-500 transition-all active:scale-95"
              >
                  Caption ✨
              </button>
              <button 
                onClick={() => setShowMemeEditor(!showMemeEditor)}
                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-pink-300 hover:text-pink-500 transition-all active:scale-95"
              >
                  Meme 😂
              </button>
              <button 
                onClick={() => setIsAnimated(!isAnimated)}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${isAnimated ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200' : 'bg-white text-slate-900 border-slate-200 hover:border-pink-300'}`}
              >
                  {isAnimated ? 'Pulse ✨' : 'Animate ✨'}
              </button>
           </div>

           {showMemeEditor && (
             <div className="grid grid-cols-1 gap-3 p-4 bg-pink-50/50 border border-pink-100/50 rounded-3xl animate-in zoom-in-95 duration-300">
                <input 
                  type="text" 
                  placeholder="TOP TEXT..." 
                  className="w-full bg-white border border-pink-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-pink-300 outline-none"
                  value={memeTop}
                  onChange={(e) => setMemeTop(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="BOTTOM TEXT..." 
                  className="w-full bg-white border border-pink-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-pink-300 outline-none"
                  value={memeBottom}
                  onChange={(e) => setMemeBottom(e.target.value)}
                />
             </div>
           )}

           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleDownload}
                className="group relative flex flex-col items-center justify-center p-10 bg-gradient-to-br from-pink-400 to-rose-600 text-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
              >
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-2xl font-black tracking-tight mb-2">Save Fragment 💾</span>
                 <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">facetocode-[fragment].png</span>
              </button>

              {!shareUrl ? (
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center justify-between p-7 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                   <span className="font-bold uppercase tracking-[0.25em] text-[10px]">
                      {isSharing ? 'Synthesizing...' : 'Generate Social Link'}
                   </span>
                   <Share2 className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-6 bg-white rounded-[2.5rem] border border-pink-100 shadow-xl space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Share with the world</span>
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs text-slate-600 truncate font-mono">
                         {shareUrl}
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-pink-500 transition-all"
                      >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={handleNativeShare}
                        className="flex-1 py-5 bg-pink-100 text-pink-600 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all"
                      >
                        Share via Device
                      </button>
                      <div className="flex-shrink-0 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`} 
                           alt="QR Code" 
                           className="w-14 h-14 mix-blend-multiply opacity-80"
                         />
                      </div>
                   </div>
                </div>
              )}
           </div>

           <button 
              onClick={onReset}
              className="mt-4 flex items-center justify-center gap-3 text-slate-400 hover:text-pink-500 transition-colors uppercase font-black tracking-[0.3em] text-[9px] group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Reset & Re-code
           </button>
        </div>

      </div>
    </div>
  );
};
