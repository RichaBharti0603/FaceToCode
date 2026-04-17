import React, { useState } from 'react';
import { Download, Share2, ArrowLeft, Check, Copy, Smartphone } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

interface DeliveryScreenProps {
  souvenir: string;
  onReset: () => void;
  onShare: () => Promise<string | undefined>;
}

export const DeliveryScreen: React.FC<DeliveryScreenProps> = ({ souvenir, onReset, onShare }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = souvenir;
    link.download = `facetocode_${Date.now()}.png`;
    link.click();
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
        <div className="flex flex-col gap-8">
           <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">Magic Delivered<span className="text-pink-400">.</span></h2>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Your aesthetic capture is ready for the world.</p>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleDownload}
                className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl hover:bg-pink-500 transition-all group"
              >
                 <span className="font-bold uppercase tracking-widest text-xs">Download High-Res</span>
                 <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </button>

              {!shareUrl ? (
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center justify-between p-6 bg-pink-50 text-pink-600 rounded-3xl hover:bg-pink-100 transition-all disabled:opacity-50"
                >
                   <span className="font-bold uppercase tracking-widest text-xs">
                      {isSharing ? 'Generating Link...' : 'Create Social Link'}
                   </span>
                   <Share2 className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-6 bg-pink-50 rounded-[2rem] border border-pink-100 space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Social Discovery Link</span>
                      <Smartphone className="w-4 h-4 text-pink-400" />
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-pink-100 rounded-xl px-4 py-3 text-xs text-slate-600 truncate font-mono">
                         {shareUrl}
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="p-3 bg-white border border-pink-100 rounded-xl hover:bg-pink-500 hover:text-white transition-all"
                      >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                   </div>

                   <div className="flex gap-3">
                      <button 
                        onClick={handleNativeShare}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-500 transition-all"
                      >
                        Native Share
                      </button>
                      <div className="flex-shrink-0 bg-white p-2 rounded-2xl border border-pink-100">
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`} 
                           alt="QR Code" 
                           className="w-12 h-12"
                         />
                      </div>
                   </div>
                </div>
              )}
           </div>

           <button 
              onClick={onReset}
              className="mt-4 flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors uppercase font-bold tracking-[0.2em] text-[10px]"
           >
              <ArrowLeft className="w-4 h-4" /> Start New Session
           </button>
        </div>

      </div>
    </div>
  );
};
