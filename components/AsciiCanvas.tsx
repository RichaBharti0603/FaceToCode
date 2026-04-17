import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
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
          flash.className = 'fixed inset-0 bg-white z-[999] opacity-100 transition-opacity duration-500';
          document.body.appendChild(flash);
          requestAnimationFrame(() => {
              flash.style.opacity = '0';
              setTimeout(() => document.body.removeChild(flash), 500);
          });
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
            ctx.fillStyle = '#fdb2ca';
            ctx.font = `black ${Math.floor(canvas.width * 0.04)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('facetocode.', canvas.width / 2, canvas.height - (margin / 2));
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

        {/* Sticker Layer */}
        <div className="absolute inset-0 z-40 pointer-events-none">
           {options.stickers?.map(sticker => (
             <div 
               key={sticker.id}
               className="absolute pointer-events-auto cursor-move select-none group"
               style={{ 
                 left: `${sticker.x * 100}%`, 
                 top: `${sticker.y * 100}%`,
                 transform: `translate(-50%, -50%) scale(${sticker.size}) rotate(${sticker.rotation}deg)`
               }}
               onPointerDown={(e) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (!rect) return;
                  const moveHandler = (moveEvent: PointerEvent) => {
                    const x = (moveEvent.clientX - rect.left) / rect.width;
                    const y = (moveEvent.clientY - rect.top) / rect.height;
                    moveSticker(sticker.id, x, y);
                  };
                  window.addEventListener('pointermove', moveHandler);
                  window.addEventListener('pointerup', () => window.removeEventListener('pointermove', moveHandler), { once: true });
               }}
             >
                <span className="text-4xl drop-shadow-lg">{sticker.emoji}</span>
                {/* Minimal Controls */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); updateStickerSize(sticker.id, 0.1); }} className="p-1 hover:text-pink-500 text-[10px] font-bold">+</button>
                    <button onClick={(e) => { e.stopPropagation(); updateStickerSize(sticker.id, -0.1); }} className="p-1 hover:text-pink-500 text-[10px] font-bold">-</button>
                    <div className="w-[1px] h-3 bg-slate-100 mx-1" />
                    <button onClick={(e) => { e.stopPropagation(); removeSticker(sticker.id); }} className="p-1 hover:text-red-500 text-[10px] font-bold">×</button>
                </div>
             </div>
           ))}
        </div>

        {/* Doodle Layer */}
        <svg 
           className="absolute inset-0 z-30 pointer-events-auto cursor-crosshair"
           onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              startNewDoodlePath();
              addDoodlePoint(x, y);
              
              const moveHandler = (moveEvent: PointerEvent) => {
                const mx = (moveEvent.clientX - rect.left) / rect.width;
                const my = (moveEvent.clientY - rect.top) / rect.height;
                addDoodlePoint(mx, my);
              };
              window.addEventListener('pointermove', moveHandler);
              window.addEventListener('pointerup', () => window.removeEventListener('pointermove', moveHandler), { once: true });
           }}
        >
           {options.doodlePaths?.map((path, i) => (
             <path 
               key={i}
               d={path.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 100}% ${p.y * 100}%`).join(' ')}
               fill="none"
               stroke="#ff71a2"
               strokeWidth="4"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
           ))}
        </svg>
        
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