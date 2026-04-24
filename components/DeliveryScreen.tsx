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
    <div className="absolute inset-0 z-[200] vintage-bg flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <div className="pattern-overlay" />
      <div className="grain-overlay" />
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Souvenir Preview */}
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="p-4 bg-white/40 backdrop-blur-md shadow-2xl rounded-[3rem] border border-white/60 rotate-[-2deg] hover:rotate-0 transition-transform duration-700 max-h-[70vh] overflow-hidden group">
              <img src={souvenir} className="w-full h-auto rounded-[2.5rem] shadow-sm" alt="Your Fragment" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-10">
           <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#6f4e37] leading-tight uppercase">Heritage Fragment Captured<span className="text-[#c08a5d]"> ✨</span></h2>
              <p className="text-[#6f4e37]/60 text-[10px] font-bold uppercase tracking-[0.4em]">a digital memory of the royal court.</p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <button 
                onClick={handleDownload}
                className="group relative flex flex-col items-center justify-center p-12 bg-white/60 text-[#6f4e37] rounded-[3rem] shadow-sm border border-white/60 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
              >
                 <div className="absolute inset-0 bg-[#f5d5c5]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="relative text-2xl font-serif font-bold tracking-tight mb-2 uppercase">Save Fragment 💾</span>
                 <span className="relative text-[9px] uppercase font-bold tracking-[0.3em] opacity-40">preserved for eternity</span>
              </button>

              {!shareUrl ? (
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center justify-between p-8 bg-[#6f4e37] text-white rounded-[2.5rem] hover:bg-[#8b5e3c] transition-all disabled:opacity-50 shadow-lg shadow-[#6f4e37]/10"
                >
                   <span className="font-bold uppercase tracking-[0.3em] text-[10px]">
                      {isSharing ? 'crafting link...' : 'generate heritage link ✨'}
                   </span>
                   <Share2 className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-lg space-y-8 animate-in zoom-in-95 duration-500">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#c08a5d]">fragment link ready</span>
                      <div className="w-2 h-2 rounded-full bg-[#c08a5d] animate-pulse" />
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/50 border border-white rounded-2xl px-5 py-4 text-xs text-[#6f4e37]/60 truncate font-mono">
                         {shareUrl}
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="p-4 bg-[#6f4e37] text-white rounded-2xl hover:bg-[#8b5e3c] transition-all active:scale-90"
                      >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={handleNativeShare}
                        className="flex-1 py-5 bg-white/60 text-[#6f4e37] border border-white rounded-[2rem] text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-[#c08a5d] hover:text-white transition-all"
                      >
                        Share via Device
                      </button>
                      <div className="flex-shrink-0 bg-white p-3 rounded-[2rem] border border-white shadow-sm">
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`} 
                           alt="QR Code" 
                           className="w-12 h-12 opacity-80 mix-blend-multiply"
                         />
                      </div>
                   </div>
                </div>
              )}
           </div>

           <button 
              onClick={onReset}
              className="mt-4 flex items-center justify-center gap-4 text-[#6f4e37]/40 hover:text-[#c08a5d] transition-all uppercase font-bold tracking-[0.4em] text-[9px] group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> return to courtyard
           </button>
        </div>

      </div>
    </div>
  );
};
