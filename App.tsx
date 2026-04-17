import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Link, useSearchParams, Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

// Core Components
import { AsciiCanvas, AsciiCanvasHandle } from './components/AsciiCanvas';
import { ControlBar } from './components/ControlBar';
import { SettingsPanel } from './components/SettingsPanel';
import { Toaster, Toast } from './components/Toaster';
import { LandingScreen } from './components/LandingScreen';

// Feature Views
import { SnapshotView } from './components/SnapshotView';
import { Dashboard } from './components/Dashboard';
import { ExploreGallery } from './components/ExploreGallery';

// Services & Types
import { AsciiOptions, VisualPreset, VISUAL_PRESETS } from './types';
import { AppState, CameraDevice } from './core/types';
import { trackEvent } from './services/analyticsService';
import { initPostHog } from './services/posthogService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [searchParams, setSearchParams] = useSearchParams();
  const [initError] = useState<string | null>(null);

  // Engine Options & State
  const [options, setOptions] = useState<AsciiOptions>(VISUAL_PRESETS[0].options as AsciiOptions);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('ascii_pro_unlocked') === 'true');
  const [isHDEnabled, setIsHDEnabled] = useState(false);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
  const [isSharing, setIsSharing] = useState(false);

  // Refs
  const canvasRef = useRef<AsciiCanvasHandle>(null);

  // Init
  useEffect(() => {
    initPostHog();
  }, []);

  const addToast = (message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleCycleStyle = () => {
    const nextIndex = (currentPresetIndex + 1) % VISUAL_PRESETS.length;
    setCurrentPresetIndex(nextIndex);
    const preset = VISUAL_PRESETS[nextIndex];
    setOptions(prev => ({ ...prev, ...preset.options }));
    addToast(`Style: ${preset.name}`);
  };

  const handleCapture = () => {
    canvasRef.current?.capture();
    addToast("Neural Snapshot Saved");
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await canvasRef.current?.share();
      addToast("Link Copied to Clipboard");
    } catch (err) {
      addToast("Persistence Failed");
    } finally {
      setIsSharing(false);
    }
  };

  const handleStartSystem = () => {
    setAppState('initializing');
    setTimeout(() => setAppState('active'), 1200);
    trackEvent('system_start');
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('ascii_pro_unlocked', 'true');
    addToast("Pro Protocol Authorized");
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden selection:bg-pink-200 selection:text-slate-900 font-sans">
      <Toaster toasts={toasts} removeToast={removeToast} />

      <Routes>
        <Route path="/s/:id" element={<SnapshotView />} />
        <Route path="/my" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreGallery />} />
        <Route path="/" element={
          <div className="relative w-full h-full flex flex-col">
            {appState !== 'active' ? (
              <LandingScreen 
                onStart={handleStartSystem} 
                isLoading={appState === 'initializing'} 
                error={initError} 
              />
            ) : (
              <>
                {/* Minimal Aesthetic Header */}
                <header className="absolute top-0 left-0 w-full p-8 z-40 flex justify-between items-center pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-xl font-light tracking-tighter text-slate-800">facetocode<span className="text-pink-400 font-black">.</span></span>
                  </div>

                  <nav className="flex items-center gap-8 pointer-events-auto bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 shadow-sm">
                    <Link to="/explore" className="text-slate-500 hover:text-slate-900 transition-colors text-[10px] uppercase font-bold tracking-widest">Explore</Link>
                    <Link to="/my" className="text-slate-500 hover:text-slate-900 transition-colors text-[10px] uppercase font-bold tracking-widest">Archive</Link>
                  </nav>
                </header>

                {/* Main Focus */}
                <main className="flex-grow relative z-10 transition-opacity duration-1000">
                  <AsciiCanvas 
                    ref={canvasRef}
                    options={options} 
                    setOptions={setOptions}
                    onCapture={(data) => {
                       trackEvent('screenshot_taken');
                       const link = document.createElement('a');
                       link.href = data;
                       link.download = `facetocode_${Date.now()}.png`;
                       link.click();
                    }} 
                    onCamerasDiscovered={setCameras}
                    selectedCameraId={selectedCameraId}
                    isUnlocked={isUnlocked}
                    isHDEnabled={isHDEnabled}
                  />
                </main>

                <ControlBar 
                   onCapture={handleCapture}
                   onShare={handleShare}
                   onCycleStyle={handleCycleStyle}
                   onOpenSettings={() => setIsSettingsOpen(true)}
                   isSharing={isSharing}
                   currentPresetName={VISUAL_PRESETS[currentPresetIndex].name}
                />

                <SettingsPanel 
                   isOpen={isSettingsOpen}
                   onClose={() => setIsSettingsOpen(false)}
                   options={options}
                   setOptions={setOptions}
                   cameras={cameras}
                   selectedCameraId={selectedCameraId}
                   onSelectCamera={setSelectedCameraId}
                   isUnlocked={isUnlocked}
                   onUnlock={handleUnlock}
                   isHDEnabled={isHDEnabled}
                   setIsHDEnabled={setIsHDEnabled}
                   isRecording={canvasRef.current?.isRecording || false}
                   onToggleRecording={() => canvasRef.current?.toggleRecording()}
                   onAnalyzeFeed={() => canvasRef.current?.analyze()}
                   isAnalyzingCaption={false}
                />
              </>
            )}
            
            {/* Aesthetic Grain / Texture (Optional) */}
            <div className="absolute inset-0 z-[5] pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;