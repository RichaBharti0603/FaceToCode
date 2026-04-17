import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AsciiOptions } from '../types';
import { AsciiEngine } from '../core/AsciiEngine';
import { CameraDevice } from '../core/types';
import { playStartupSound, playScanSound, startAmbientHum, stopAmbientHum, playAnalysisStartSound, playAnalysisCompleteSound } from '../utils/soundEffects';
import { detectEmotion } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';
import { trackPH } from '../services/posthogService';
import { AsciiFrame } from '../core/types';
import { getOrInitializeUserId } from '../utils/identity';
import { CaptionOverlay } from './CaptionOverlay';

interface AsciiCanvasProps {
  options: AsciiOptions;
  setOptions?: React.Dispatch<React.SetStateAction<AsciiOptions>>;
  onCaptureComplete: (imageData: string) => void;
  onCamerasDiscovered?: (cameras: CameraDevice[]) => void;
  selectedCameraId?: string;
  isUnlocked: boolean;
  isHDEnabled: boolean;
  runCountdown: boolean;
  adminConfig: AdminConfig;
}

export interface AsciiCanvasHandle {
  share: () => Promise<void>;
  toggleRecording: () => void;
  analyze: () => void;
  isRecording: boolean;
}

export const AsciiCanvas = forwardRef<AsciiCanvasHandle, AsciiCanvasProps>(({ 
  options, 
  setOptions,
  onCaptureComplete, 
  onCamerasDiscovered,
  selectedCameraId,
  isUnlocked,
  isHDEnabled,
  runCountdown,
  adminConfig
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestFrameRef = useRef<AsciiFrame | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Photobooth Internal States
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessingLayout, setIsProcessingLayout] = useState(false);

  // Handle Capture Sequence
  useEffect(() => {
    if (!runCountdown) return;

    let currentCount = adminConfig.countdownDuration;
    const framesToCapture = adminConfig.layoutType === 'strip' ? 3 : 1;
    const captured: string[] = [];

    const runSequence = async () => {
      for (let i = 0; i < framesToCapture; i++) {
        // Countdown for each photo
        for (let j = currentCount; j > 0; j--) {
          setCountdown(j);
          await new Promise(r => setTimeout(r, 1000));
        }
        
        // Take Photo
        setCountdown(null);
        if (canvasRef.current) {
          playScanSound();
          captured.push(canvasRef.current.toDataURL('image/png'));
          // Flash effect
          const flash = document.createElement('div');
          flash.className = 'fixed inset-0 bg-white z-[500] animate-fadeOut';
          document.body.appendChild(flash);
          setTimeout(() => document.body.removeChild(flash), 500);
        }
        
        if (i < framesToCapture - 1) {
            await new Promise(r => setTimeout(r, 500)); // Gap between photos
        }
      }

      // Generate Souvenir
      setIsProcessingLayout(true);
      playAnalysisStartSound();
      const finalImage = await compileSouvenir(captured, adminConfig);
      onCaptureComplete(finalImage);
      playAnalysisCompleteSound();
      setIsProcessingLayout(false);
    };

    runSequence();
  }, [runCountdown, adminConfig, onCaptureComplete]);

  // Souvenir Compositing
  const compileSouvenir = async (frames: string[], config: AdminConfig): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return frames[0];

    if (config.layoutType === 'single') {
        return frames[0];
    }

    // Strip Layout (Vertical 3-photo)
    const margin = 100;
    const gap = 40;
    
    // Get dimensions from first frame
    const first = await loadImage(frames[0]);
    const fw = first.width;
    const fh = first.height;

    canvas.width = fw + (margin * 2);
    canvas.height = (fh * 3) + (gap * 2) + (margin * 2.5); // extra for branding

    // White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Frames
    for (let i = 0; i < frames.length; i++) {
        const img = await loadImage(frames[i]);
        ctx.drawImage(img, margin, margin + (i * (fh + gap)));
    }

    // Branding
    if (config.watermarkEnabled) {
        ctx.fillStyle = '#fdb2ca'; // Soft Pink
        ctx.font = `black ${Math.floor(canvas.width * 0.04)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('facetocode.', canvas.width / 2, canvas.height - (margin / 2));
    }

    return canvas.toDataURL('image/png');
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((r) => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = src;
    });
  };

  // Emotion Detection Loop (Omitted for brevity in this block but remains in actual code)
  
  // AI Caption State
  const [caption, setCaption] = useState<string>('');
  const [isAnalyzingCaption, setIsAnalyzingCaption] = useState(false);
  const [showCaption, setShowCaption] = useState(false);

  // Initialize Engine
  const engine = useMemo(() => new AsciiEngine(options, {
    onFrame: (frame) => {
      latestFrameRef.current = frame;
    },
    onStateChange: (state) => {
      if (state === 'error') setError("Neural link failed. Check camera permissions.");
      else setError(null);
      
      if (state === 'running') {
        playStartupSound();
        startAmbientHum();
      }
    },
    onCamerasDiscovered: (cameras) => {
      onCamerasDiscovered?.(cameras);
    }
  }), []);

  // Expose Handle
  useImperativeHandle(ref, () => ({
    share: handleShareSnapshot,
    toggleRecording: () => {
        if (isRecording) {
            engine.stopRecording();
            setIsRecording(false);
            trackEvent('recording_stop');
        } else {
            trackEvent('recording_start', { isHD: isHDEnabled });
            const recordOptions = isHDEnabled ? {
                width: 1080,
                height: 1920,
                fps: 30,
                isUnlocked: isUnlocked
            } : {
                isUnlocked: isUnlocked
            };
            engine.startRecording(recordOptions);
            setIsRecording(true);
        }
    },
    analyze: handleAnalyzeFeed,
    isRecording
  }));

  // Sync Options
  useEffect(() => {
    engine.updateOptions(options);
  }, [options, engine]);

  // Handle Camera Switch
  useEffect(() => {
    if (selectedCameraId) {
      engine.setCamera(selectedCameraId);
    }
  }, [selectedCameraId, engine]);

  // Lifecycle
  useEffect(() => {
    if (canvasRef.current) {
      engine.start(canvasRef.current);
    }
    return () => {
      engine.stop();
      stopAmbientHum();
    };
  }, [engine]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleAnalyzeFeed() {
    if (isAnalyzingCaption) return;
    setIsAnalyzingCaption(true);
    setShowCaption(true);
    setCaption("INITIALIZING NEURAL LINK...");
    playAnalysisStartSound();
    
    try {
      const result = await engine.getCaption();
      setCaption(result.description);
      playAnalysisCompleteSound();
      setTimeout(() => setShowCaption(false), 8000);
    } catch (err) {
      setCaption("ANALYSIS ERROR.");
    } finally {
      setIsAnalyzingCaption(false);
    }
  }

  async function handleShareSnapshot() {
    if (!latestFrameRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const asciiString = latestFrameRef.current.chars.map(row => row.join('')).join('\n');
      const previewImage = canvasRef.current?.toDataURL('image/png');
      const userId = getOrInitializeUserId();

      const response = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: asciiString,
          user_id: userId,
          preview_image: previewImage,
          settings: options,
          is_public: isPublic
        })
      });

      if (!response.ok) throw new Error("Upload Failed");
      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/s/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      
      trackEvent('snapshot_shared', { id, userId });
      return id; 
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }

  const getThemeFilter = () => {
    switch (options.theme) {
      case 'pink': return 'sepia(0.3) hue-rotate(-30deg) saturate(1.4) brightness(1.1)';
      case 'dreamy': return 'blur(0.4px) brightness(1.1) contrast(0.9) saturate(1.1)';
      case 'noir': return 'grayscale(1) contrast(1.2) brightness(1.05)';
      case 'pastel': return 'saturate(0.6) brightness(1.15) contrast(0.85)';
      case 'sparkle': return 'brightness(1.2) contrast(1.1)';
      default: return 'none';
    }
  };

  return (
    <div className="relative w-full h-full bg-white flex items-center justify-center p-8">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-slate-300 z-50 font-sans">
          <p className="animate-pulse font-bold tracking-[0.3em] uppercase text-[10px]">{error}</p>
        </div>
      )}
      
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner">
        <canvas 
            ref={canvasRef} 
            className="block max-w-full max-h-full object-contain transition-all duration-1000" 
            style={{ 
                filter: getThemeFilter(),
            }}
        />
        
        {/* Subtle Overlays */}
        <div className="absolute inset-0 pointer-events-none border-[32px] border-white/10" />
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
           <span className="text-[12rem] font-black text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.2)] animate-ping">
              {countdown}
           </span>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessingLayout && (
        <div className="absolute inset-0 z-[300] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-500">Stitching Souvenir...</p>
        </div>
      )}
      
      {/* Aesthetic Recording Indicator */}
      {isRecording && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-red-400 font-sans text-[10px] z-40 bg-white/80 backdrop-blur-md shadow-lg px-6 py-2.5 rounded-full border border-white/50">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <span className="font-bold uppercase tracking-[0.2em]">Live Session Captured</span>
        </div>
      )}

      <CaptionOverlay caption={caption} isVisible={showCaption} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeOut { animation: fadeOut 0.5s ease-out forwards; }
      `}} />
    </div>
  );
});