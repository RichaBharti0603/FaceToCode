import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AsciiOptions } from '../types';
import { AsciiEngine } from '../core/AsciiEngine';
import { playStartupSound, playScanSound, startAmbientHum, stopAmbientHum } from '../utils/soundEffects';
import { ScanEye, Camera, Circle } from 'lucide-react';

interface AsciiCanvasProps {
  options: AsciiOptions;
  onCapture: (imageData: string) => void;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({ options, onCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Engine
  const engine = useMemo(() => new AsciiEngine(options, {
    onStateChange: (state) => {
      if (state === 'error') setError("Neural link failed. Check camera permissions.");
      else setError(null);
      
      if (state === 'running') {
        playStartupSound();
        startAmbientHum();
      }
    }
  }), []);

  // Sync Options
  useEffect(() => {
    engine.updateOptions(options);
  }, [options, engine]);

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
    } else {
      engine.startRecording();
      setIsRecording(true);
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

        {/* Scan & Analyze Button (Primary) */}
        <button 
          onClick={handleCaptureClick}
          className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 p-6 rounded-full backdrop-blur-md transition-all active:scale-95 group relative hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
          title="Scan & Analyze"
        >
          <div className="absolute inset-0 rounded-full border border-green-500 opacity-50 animate-ping"></div>
          <ScanEye className="w-8 h-8" />
        </button>

        {/* Video Record Button */}
        <button 
          onClick={toggleRecording}
          className={`bg-black/60 ${isRecording ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-green-400 border-green-500/50'} border p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <Circle className={`w-6 h-6 ${isRecording ? 'fill-red-500' : ''}`} />
        </button>
      </div>
    </div>
  );
};