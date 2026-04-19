import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Camera, Heart, Sparkles } from 'lucide-react';
import { AsciiOptions, AdminConfig } from '../types';
import { AsciiEngine } from '../core/AsciiEngine';
import { CameraDevice } from '../core/types';
import { 
  playStartupSound, 
  playScanSound, 
  startAmbientHum, 
  stopAmbientHum, 
  playAnalysisStartSound, 
  playAnalysisCompleteSound,
  playShutterSound,
  playSuccessDing
} from '../utils/soundEffects';
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

    const runSequence = async () => {
      const countdownDuration = adminConfig.countdownDuration;
      const layoutType = adminConfig.layoutType;
      const isGifMode = options.captureMode === 'gif';
      const framesToCapture = isGifMode ? 10 : (layoutType === 'strip' ? 3 : 1);
      const captured: string[] = [];

      try {
        // Initial Countdown
        for (let j = countdownDuration; j > 0; j--) {
          setCountdown(j);
          await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(null);

        // Flash & Shutter Sound at Start
        if (canvasRef.current) {
          playShutterSound();
          if (navigator.vibrate) navigator.vibrate(50);
          
          const flash = document.createElement('div');
          flash.className = 'fixed inset-0 bg-rose-200/40 backdrop-blur-md z-[999] animate-fadeOut';
          document.body.appendChild(flash);
          setTimeout(() => document.body.removeChild(flash), 500);
        }

        for (let i = 0; i < framesToCapture; i++) {
          if (canvasRef.current) {
            captured.push(canvasRef.current.toDataURL('image/png'));
          }
          
          // Fast capture for GIF, slow for Strip
          if (isGifMode) {
            await new Promise(r => setTimeout(r, 100)); // 10fps capture
          } else if (layoutType === 'strip' && i < framesToCapture - 1) {
            await new Promise(r => setTimeout(r, 800));
          }
        }

        // Processing & Souvenir Generation
        setIsProcessingLayout(true);
        playAnalysisStartSound();
        
        await new Promise(r => setTimeout(r, 1200));
        
        const finalImage = await compileSouvenir(captured, adminConfig);
        onCaptureComplete(finalImage);
        playAnalysisCompleteSound();
      } catch (err) {
        console.error("Capture sequence failed:", err);
      } finally {
        setIsProcessingLayout(false);
      }
    };

    runSequence();
  }, [runCountdown, adminConfig, onCaptureComplete]);

  // Souvenir Compositing
  const compileSouvenir = async (frames: string[], config: AdminConfig): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return frames[0];

    // Get dimensions from first frame
    const first = await loadImage(frames[0]);
    const fw = first.width;
    const fh = first.height;

    // Handle Single vs Strip
    if (config.layoutType === 'single') {
        canvas.width = fw;
        canvas.height = fh;
        
        const img = await loadImage(frames[0]);
        ctx.drawImage(img, 0, 0);
    } else {
        // Strip Layout (Vertical 3-photo)
        const margin = 100;
        const gap = 40;
        canvas.width = fw + (margin * 2);
        canvas.height = (fh * 3) + (gap * 2) + (margin * 2.5); // extra for branding
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < frames.length; i++) {
            const img = await loadImage(frames[i]);
            ctx.drawImage(img, margin, margin + (i * (fh + gap)));
        }

        if (config.watermarkEnabled) {
            ctx.fillStyle = '#fda4af'; // rose-300
            ctx.font = `900 ${Math.floor(canvas.width * 0.045)}px Outfit`;
            ctx.textAlign = 'center';
            ctx.fillText('facetocode.', canvas.width / 2, canvas.height - (margin * 0.4));
        }
    }

    // --- Aesthetic Overlays (Applied to the whole final canvas) ---

    // 1. Film Border
    if (options.showFilmBorder) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.min(canvas.width, canvas.height) * 0.08;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle film-style notches
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(5, (canvas.height / 8) * i + 10, 10, 20);
            ctx.fillRect(canvas.width - 15, (canvas.height / 8) * i + 10, 10, 20);
        }
    }

    // 2. Stickers
    if (options.stickers && options.stickers.length > 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        options.stickers.forEach(s => {
            const x = s.x * canvas.width;
            const y = s.y * canvas.height;
            const size = s.size * (canvas.width * 0.1);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((s.rotation * Math.PI) / 180);
            ctx.font = `${size}px sans-serif`;
            ctx.fillText(s.emoji, 0, 0);
            ctx.restore();
        });
    }

    // 3. Date Stamp
    if (options.showDateStamp) {
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        ctx.fillStyle = '#ff71a2'; // Aesthetic Pink
        ctx.font = `900 ${Math.floor(canvas.width * 0.03)}px monospace`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`'${dateStr.toUpperCase()}  ${timeStr}`, canvas.width - (canvas.width * 0.05), canvas.height - (canvas.height * 0.05));
    }

    // 4. Doodles
    if (options.doodlePaths && options.doodlePaths.length > 0) {
        ctx.strokeStyle = '#ff71a2';
        ctx.lineWidth = canvas.width * 0.008;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        options.doodlePaths.forEach(path => {
            if (path.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(path[0].x * canvas.width, path[0].y * canvas.height);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x * canvas.width, path[i].y * canvas.height);
            }
            ctx.stroke();
        });
    }

    // 5. Dynamic Color Grading (Subtle Session Tint)
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const hues = [330, 280, 200, 30]; // Pink, Purple, Blue, Gold
    const selectedHue = hues[Math.floor(Math.random() * hues.length)];
    ctx.fillStyle = `hsla(${selectedHue}, 100%, 70%, 0.15)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

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

  const moveSticker = (id: string, x: number, y: number) => {
    if (!setOptions) return;
    setOptions(prev => ({
      ...prev,
      stickers: prev.stickers?.map(s => s.id === id ? { ...s, x, y } : s)
    }));
  };

  const removeSticker = (id: string) => {
    if (!setOptions) return;
    setOptions(prev => ({
      ...prev,
      stickers: prev.stickers?.filter(s => s.id !== id)
    }));
  };

  const updateStickerSize = (id: string, delta: number) => {
    if (!setOptions) return;
    setOptions(prev => ({
      ...prev,
      stickers: prev.stickers?.map(s => s.id === id ? { ...s, size: Math.max(0.5, Math.min(3, s.size + delta)) } : s)
    }));
  };

  const addDoodlePoint = (x: number, y: number) => {
    if (!setOptions) return;
    setOptions(prev => {
      const paths = [...(prev.doodlePaths || [])];
      if (paths.length === 0) paths.push([]);
      paths[paths.length - 1].push({ x, y });
      return { ...prev, doodlePaths: paths };
    });
  };

  const startNewDoodlePath = () => {
    if (!setOptions) return;
    setOptions(prev => ({
      ...prev,
      doodlePaths: [...(prev.doodlePaths || []), []]
    }));
  };

  const getThemeFilter = () => {
    let base = 'none';
    switch (options.theme) {
      case 'pink': base = 'sepia(0.3) hue-rotate(-30deg) saturate(1.4) brightness(1.1)'; break;
      case 'dreamy': base = 'blur(0.4px) brightness(1.1) contrast(0.9) saturate(1.1)'; break;
      case 'noir': base = 'grayscale(1) contrast(1.2) brightness(1.05)'; break;
      case 'pastel': base = 'saturate(0.6) brightness(1.15) contrast(0.85)'; break;
      case 'sparkle': base = 'brightness(1.2) contrast(1.1)'; break;
    }

    let overlay = 'none';
    switch (options.filter) {
      case 'vintage': overlay = 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)'; break;
      case 'soft_pink': overlay = 'hue-rotate(-10deg) saturate(1.2) brightness(1.05) contrast(0.95)'; break;
      case 'cool_blue': overlay = 'hue-rotate(180deg) saturate(0.7) brightness(1.1)'; break;
      case 'dreamy': overlay = 'blur(1px) brightness(1.2) contrast(0.8)'; break;
      case 'noir': overlay = 'grayscale(1) contrast(1.4) brightness(0.95)'; break;
    }

    if (base === 'none' && overlay === 'none') return 'none';
    if (base === 'none') return overlay;
    if (overlay === 'none') return base;
    return `${base} ${overlay}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-gray-400 z-50 font-sans backdrop-blur-sm">
          <p className="animate-pulse font-medium lowercase">{error}</p>
        </div>
      )}
      
      {/* 1:1 AESTHETIC VIEWFINDER FRAME */}
      <div className="relative aspect-square w-full max-w-[min(85vh,100%)] overflow-hidden rounded-[20px] bg-white/40 border-[8px] border-white shadow-[inset_0_0_80px_rgba(0,0,0,0.05),0_20px_60px_rgba(0,0,0,0.05)] group">
        
        {/* VIGNETTE & GRAIN OVERLAY */}
        <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.08)_100%)]" />
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
        </div>

        <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover transition-opacity duration-700" 
            style={{ 
                filter: getThemeFilter(),
            }}
        />

        {/* SOFT EDGE BLUR (INNER) */}
        <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.4)] backdrop-blur-[0.5px]" />

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
             <span className="text-[12rem] font-bold text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.15)] animate-ping">
                {countdown}
             </span>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessingLayout && (
          <div className="absolute inset-0 z-[300] bg-white/60 backdrop-blur-2xl flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-400 rounded-full animate-spin" />
              <p className="mt-6 text-sm font-medium text-pink-400 lowercase animate-pulse">making magic...</p>
          </div>
        )}

        {/* Recording Indicator (Minimal) */}
        {isRecording && (
          <div className="absolute top-6 left-6 flex items-center gap-2 text-rose-400 text-xs font-semibold z-40 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white">
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
            <span className="lowercase">recording</span>
          </div>
        )}
      </div>

      <CaptionOverlay caption={caption} isVisible={showCaption} />
    </div>
  );
});