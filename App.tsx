import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AnalysisModal } from './components/AnalysisModal';
import { AsciiOptions, AnalysisResult } from './types';
import { AppState, CameraDevice } from './core/types';
import { analyzeImage } from './services/geminiService';
import { Routes, Route, Link, useSearchParams } from 'react-router-dom';
import { SnapshotView } from './components/SnapshotView';
import { Dashboard } from './components/Dashboard';
import { ExploreGallery } from './components/ExploreGallery';
import { Camera, Terminal, Zap, ScanEye, Archive, Compass } from 'lucide-react';
import { playAnalysisStartSound, playAnalysisCompleteSound } from './utils/soundEffects';
import { LandingScreen } from './components/LandingScreen';
import { trackEvent } from './services/analyticsService';
import { initPostHog } from './services/posthogService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [searchParams, setSearchParams] = useSearchParams();
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
  
  // Init Analytics
  useEffect(() => {
    initPostHog();
  }, []);

  // Handle Remix Detection
  useEffect(() => {
    const remixId = searchParams.get('remix');
    if (remixId) {
      const fetchRemix = async () => {
        try {
          const response = await fetch(`/api/snapshot?id=${remixId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.settings) {
              setOptions(prev => ({ ...prev, ...data.settings }));
              // Clear param to avoid re-triggering
              setParamsWithoutReload({ ...Object.fromEntries(searchParams) }); 
            }
          }
        } catch (e) {
          console.error("Remix sync failed:", e);
        }
      };
      fetchRemix();
    }
    
    function setParamsWithoutReload(params: any) {
       delete params.remix;
       setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    <Routes>
      <Route path="/s/:id" element={<SnapshotView />} />
      <Route path="/my" element={<Dashboard />} />
      <Route path="/explore" element={<ExploreGallery />} />
      <Route path="/" element={
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
                <div className="flex items-center gap-6 pointer-events-auto">
                    <Link to="/explore" className="flex items-center gap-2 text-green-500 hover:text-green-300 text-[10px] uppercase font-bold tracking-widest transition-colors">
                        <Compass className="w-3 h-3" /> Explore Community
                    </Link>
                    <Link to="/my" className="flex items-center gap-2 text-green-600 hover:text-green-400 text-[10px] uppercase font-bold tracking-widest transition-colors">
                        <Archive className="w-3 h-3" /> My Archives
                    </Link>
                    <div className="text-green-800 text-xs hidden md:flex gap-4 font-mono">
                      <span>SYS.STATUS: ONLINE</span>
                      <span>CAM.FEED: {selectedCameraId ? 'TRACKING' : 'ACTIVE'}</span>
                      <span className="animate-pulse">LATENCY: {(Math.random() * 50).toFixed(1)}ms</span>
                    </div>
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
      } />
    </Routes>
  );
};

export default App;