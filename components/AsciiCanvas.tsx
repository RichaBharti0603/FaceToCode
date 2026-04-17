import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AsciiOptions } from '../types';
import { AsciiEngine } from '../core/AsciiEngine';
import { CameraDevice } from '../core/types';
import { playStartupSound, playScanSound, startAmbientHum, stopAmbientHum, playAnalysisStartSound, playAnalysisCompleteSound } from '../utils/soundEffects';
import { ScanEye, Camera, Circle, Brain, Share2 } from 'lucide-react';
import { CaptionOverlay } from './CaptionOverlay';
import { detectEmotion } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';
import { AsciiFrame } from '../core/types';

interface AsciiCanvasProps {
  options: AsciiOptions;
  setOptions?: React.Dispatch<React.SetStateAction<AsciiOptions>>;
  onCapture: (imageData: string) => void;
  onCamerasDiscovered?: (cameras: CameraDevice[]) => void;
  selectedCameraId?: string;
  isUnlocked: boolean;
  isHDEnabled: boolean;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({ 
  options, 
  setOptions,
  onCapture, 
  onCamerasDiscovered,
  selectedCameraId,
  isUnlocked,
  isHDEnabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestFrameRef = useRef<AsciiFrame | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Emotion Detection Loop
  useEffect(() => {
    if (!options.autoEmotion || !setOptions) return;

    const interval = setInterval(async () => {
      if (canvasRef.current) {
        // Fast, low-res capture for heartbeat
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

  const handleCaptureClick = () => {
    if (canvasRef.current) {
      playScanSound();
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  const handleScreenshotClick = () => {
    if (canvasRef.current) {
      playScanSound();
      trackEvent('screenshot_taken');
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cyber_ascii_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleRecording = () => {
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
  };

  const handleAnalyzeFeed = async () => {
    if (isAnalyzingCaption) return;
    
    setIsAnalyzingCaption(true);
    setShowCaption(true);
    setCaption("INITIALIZING NEURAL LINK... ANALYZING VISUAL BUFFER...");
    playAnalysisStartSound();
    
    try {
      const result = await engine.getCaption();
      setCaption(result.description);
      playAnalysisCompleteSound();
      
      // Auto-hide after 10 seconds
      setTimeout(() => setShowCaption(false), 10000);
    } catch (err) {
      setCaption("ANALYSIS ERROR: UNABLE TO DECODE VISUAL SIGNALS.");
    } finally {
      setIsAnalyzingCaption(false);
    }
  };

  const handleShareSnapshot = async () => {
    if (!latestFrameRef.current || isSharing) return;

    setIsSharing(true);
    playScanSound();

    try {
      const asciiString = latestFrameRef.current.chars
        .map(row => row.join(''))
        .join('\n');

      const response = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: asciiString })
      });

      if (!response.ok) throw new Error("Upload Failed");
      
      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/s/${id}`;
      
      await navigator.clipboard.writeText(shareUrl);
      alert(`NEURAL FRAGMENT PERSISTED.\nLINK COPIED TO CLIPBOARD:\n${shareUrl}`);
      
      // Track session event
      const analyticEvent: any = 'screenshot_taken'; // Reuse or define new
      trackEvent(analyticEvent, { type: 'shareable', id });
    } catch (err) {
      alert("CRITICAL ERROR: DATA PERSISTENCE FAILED.");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-red-500 z-50 font-mono">
          <p className="animate-pulse">{error}</p>
        </div>
      )}
      
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-red-500 font-mono text-xs z-40 bg-black/50 px-2 py-1 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span>REC: {(Date.now() / 1000 % 1000).toFixed(0)}s</span>
        </div>
      )}

      {/* Floating Controls Container */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-40">
        {/* Screenshot Button */}
        <button 
          onClick={handleScreenshotClick}
          className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
          title="Save Snapshot"
        >
          <Camera className="w-6 h-6" />
        </button>

        {/* Share Snapshot (NEW) */}
        <button 
          onClick={handleShareSnapshot}
          disabled={isSharing}
          className={`bg-black/60 ${isSharing ? 'text-yellow-500 animate-pulse' : 'text-yellow-400'} border border-yellow-500/50 p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,200,0,0.3)]`}
          title="Generate Share Link"
        >
          <Share2 className={`w-6 h-6 ${isSharing ? 'animate-bounce' : ''}`} />
        </button>

        {/* Scan & Analyze Button (Primary) */}
        <button 
          onClick={handleCaptureClick}
          className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 p-6 rounded-full backdrop-blur-md transition-all active:scale-95 group relative hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
          title="Scan & Analyze"
        >
          <div className="absolute inset-0 rounded-full border border-green-500 opacity-50 animate-ping"></div>
          <ScanEye className="w-8 h-8" />
        </button>

        {/* AI Caption Button */}
        <button 
          onClick={handleAnalyzeFeed}
          className={`bg-black/60 ${isAnalyzingCaption ? 'text-blue-400 border-blue-500/50' : 'text-blue-500 border-blue-500/50'} border p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,100,255,0.3)]`}
          title="Intelligence Assessment"
        >
          <Brain className={`w-6 h-6 ${isAnalyzingCaption ? 'animate-pulse' : ''}`} />
        </button>

        {/* Video Record Button */}
        <button 
          onClick={toggleRecording}
          className={`bg-black/60 ${isRecording ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-green-400 border-green-500/50'} border p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]`}
          title={isRecording ? "Stop Recording" : (isHDEnabled ? "Record HD Video" : "Record Video")}
        >
          <Circle className={`w-6 h-6 ${isRecording ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      <CaptionOverlay caption={caption} isVisible={showCaption} />
    </div>
  );
};