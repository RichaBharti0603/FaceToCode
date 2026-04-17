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
  onCapture: (imageData: string) => void;
  onCamerasDiscovered?: (cameras: CameraDevice[]) => void;
  selectedCameraId?: string;
  isUnlocked: boolean;
  isHDEnabled: boolean;
}

export interface AsciiCanvasHandle {
  capture: () => void;
  share: () => Promise<void>;
  toggleRecording: () => void;
  analyze: () => void;
  isRecording: boolean;
}

export const AsciiCanvas = forwardRef<AsciiCanvasHandle, AsciiCanvasProps>(({ 
  options, 
  setOptions,
  onCapture, 
  onCamerasDiscovered,
  selectedCameraId,
  isUnlocked,
  isHDEnabled
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestFrameRef = useRef<AsciiFrame | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Emotion Detection Loop
  useEffect(() => {
    if (!options.autoEmotion || !setOptions) return;

    const interval = setInterval(async () => {
      if (canvasRef.current) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 160;
        tempCanvas.height = 120;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(canvasRef.current, 0, 0, 160, 120);
        const thumb = tempCanvas.toDataURL('image/jpeg', 0.6);
        
        try {
          const emotion = await detectEmotion(thumb);
          const modeMap: Record<string, 'color' | 'matrix' | 'bw'> = {
            happy: 'color',
            serious: 'matrix',
            neutral: 'bw',
          };
          
          if (modeMap[emotion]) {
             setOptions(prev => ({ ...prev, colorMode: modeMap[emotion] }));
          }
        } catch (err) {
          console.error("Emotion heartbeat failed:", err);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [options.autoEmotion, setOptions]);
  
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
    capture: () => {
        if (canvasRef.current) {
            playScanSound();
            const dataUrl = canvasRef.current.toDataURL('image/png');
            onCapture(dataUrl);
        }
    },
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
    playScanSound();
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
      return id; // Return ID for outer toaster
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
      
      {/* Aesthetic Recording Indicator */}
      {isRecording && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-red-400 font-sans text-[10px] z-40 bg-white/80 backdrop-blur-md shadow-lg px-6 py-2.5 rounded-full border border-white/50">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <span className="font-bold uppercase tracking-[0.2em]">Live Session Captured</span>
        </div>
      )}

      <CaptionOverlay caption={caption} isVisible={showCaption} />
    </div>
  );
});