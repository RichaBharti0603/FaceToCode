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

  return (
    <div className="relative w-full h-full bg-black">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-red-500 z-50 font-mono">
          <p className="animate-pulse font-bold">{error}</p>
        </div>
      )}
      
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-6 left-6 flex items-center gap-3 text-red-500 font-mono text-[10px] z-40 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-red-500/30">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="font-black uppercase tracking-widest">Recording Stream</span>
        </div>
      )}

      <CaptionOverlay caption={caption} isVisible={showCaption} />
    </div>
  );
});