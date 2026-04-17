import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Link, useSearchParams, Navigate } from 'react-router-dom';
import { Camera, Terminal, Archive, Compass, ChevronRight } from 'lucide-react';

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
    <div className="relative w-full h-screen bg-black overflow-hidden selection:bg-green-500 selection:text-black">
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
                {/* Minimal Global Header */}
                <header className="absolute top-0 left-0 w-full p-6 z-40 flex justify-between items-start pointer-events-none">
                  <div className="flex flex-col gap-1 pointer-events-auto">
                    <div className="flex items-center gap-3 text-white font-black uppercase tracking-[0.2em] text-sm">
                      <Terminal className="w-4 h-4 text-green-500" />
                      FaceToCode
                    </div>
                    <div className="text-[8px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                       <span>Secure Uplink: Stable</span>
                       <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <nav className="flex items-center gap-6 pointer-events-auto">
                    <Link to="/explore" className="text-white/40 hover:text-white transition-colors">
                       <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                          <Compass className="w-3 h-3" /> Explore
                       </div>
                    </Link>
                    <Link to="/my" className="text-white/40 hover:text-white transition-colors">
                       <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                          <Archive className="w-3 h-3" /> Archive
                       </div>
                    </Link>
                  </nav>
                </header>

                {/* Focus: The Canvas */}
                <main className="flex-grow relative z-10">
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

                {/* Minimal Control Bar */}
                <ControlBar 
                   onCapture={handleCapture}
                   onShare={handleShare}
                   onCycleStyle={handleCycleStyle}
                   onOpenSettings={() => setIsSettingsOpen(true)}
                   isSharing={isSharing}
                   currentPresetName={VISUAL_PRESETS[currentPresetIndex].name}
                />

                {/* Advanced Settings Overlay */}
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
                   isAnalyzingCaption={false} // Managed internally by canvas
                />
              </>
            )}
            
            {/* Scanlines Effect */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;