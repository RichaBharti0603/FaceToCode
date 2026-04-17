import React, { useState, useCallback } from 'react';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AnalysisModal } from './components/AnalysisModal';
import { AsciiOptions, AnalysisResult } from './types';
import { AppState, CameraDevice } from './core/types';
import { analyzeImage } from './services/geminiService';
import { Camera, Terminal, Zap, ScanEye } from 'lucide-react';
import { playAnalysisStartSound, playAnalysisCompleteSound } from './utils/soundEffects';
import { LandingScreen } from './components/LandingScreen';
import { trackEvent } from './services/analyticsService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [initError, setInitError] = useState<string | null>(null);

  const [options, setOptions] = useState<AsciiOptions>({
    fontSize: 12,
    brightness: 1.0,
    contrast: 1.0,
    colorMode: 'matrix',
    density: 'complex',
    resolution: 0.15, // Default resolution factor
    autoEmotion: false
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
  
  // Feature Gating State
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('ascii_pro_unlocked') === 'true';
  });
  const [isHDEnabled, setIsHDEnabled] = useState(false);

  const handleStartSystem = () => {
    setAppState('initializing');
    trackEvent('system_start');
    // Simulate initialization delay for smooth transition
    setTimeout(() => {
        setAppState('active');
    }, 1500);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('ascii_pro_unlocked', 'true');
    trackEvent('pro_unlock');
  };

  const handleCapture = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsModalOpen(true);
    playAnalysisStartSound();

    try {
      const result = await analyzeImage(imageData);
      setAnalysisResult(result);
      playAnalysisCompleteSound();
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult({
        description: "SYSTEM ERROR: Neural link connection failed.",
        tags: ["ERROR", "OFFLINE"],
        threatLevel: "UNKNOWN"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {appState !== 'active' ? (
        <LandingScreen 
            onStart={handleStartSystem} 
            isLoading={appState === 'initializing'} 
            error={initError} 
        />
      ) : (
        <>
          {/* Header / HUD */}
          <header className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-green-500 pointer-events-auto">
              <Terminal className="w-6 h-6 animate-pulse" />
              <h1 className="text-xl font-bold tracking-widest uppercase">FaceToCode<span className="text-xs ml-1 opacity-70 italic">v2.0</span></h1>
            </div>
            <div className="text-green-800 text-xs flex gap-4 font-mono">
              <span>SYS.STATUS: ONLINE</span>
              <span>CAM.FEED: {selectedCameraId ? 'TRACKING' : 'ACTIVE'}</span>
              <span className="animate-pulse">LATENCY: {(Math.random() * 50).toFixed(1)}ms</span>
            </div>
          </header>

          {/* Main Canvas Area */}
          <main className="flex-grow relative z-10 transition-opacity duration-1000">
            <AsciiCanvas 
              options={options} 
              setOptions={setOptions}
              onCapture={handleCapture} 
              onCamerasDiscovered={setCameras}
              selectedCameraId={selectedCameraId}
              isUnlocked={isUnlocked}
              isHDEnabled={isHDEnabled}
            />
          </main>

          {/* Controls */}
          <ControlPanel 
            options={options} 
            setOptions={setOptions} 
            cameras={cameras} 
            selectedCameraId={selectedCameraId}
            onSelectCamera={setSelectedCameraId}
            isUnlocked={isUnlocked}
            onUnlock={handleUnlock}
            isHDEnabled={isHDEnabled}
            setIsHDEnabled={setIsHDEnabled}
          />
        </>
      )}

      {/* Loading/Analysis Modal */}
      {isModalOpen && (
        <AnalysisModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          isLoading={isAnalyzing}
          result={analysisResult}
        />
      )}
      
      {/* Decorative overlaid scanlines */}
      <div className="absolute inset-0 z-[5] pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

export default App;