import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Link, useSearchParams, Navigate } from 'react-router-dom';
import { Heart, Grid } from 'lucide-react';

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
import { 
  AsciiOptions, 
  VisualPreset, 
  VISUAL_PRESETS, 
  PhotoboothState, 
  AdminConfig, 
  DEFAULT_ADMIN_CONFIG 
} from './types';
import { AppState, CameraDevice } from './core/types';
import { trackEvent } from './services/analyticsService';
import { initPostHog } from './services/posthogService';

// specialized components for the flow
import { DeliveryScreen } from './components/DeliveryScreen';
import { AdminPanel } from './components/AdminPanel';
import { NavSheet } from './components/NavSheet';
import { CreativeToolbar } from './components/CreativeToolbar';
import { CreativeSheet } from './components/CreativeSheet';
import { DebugPanel } from './components/DebugPanel';

const App: React.FC = () => {
  const [appState, setAppState] = useState<PhotoboothState>('landing');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCreativeSheetOpen, setIsCreativeSheetOpen] = useState(false);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_ADMIN_CONFIG);
  const [capturedSouvenir, setCapturedSouvenir] = useState<string | null>(null);
  
  // Inactivity Timer for Auto-Reset
  const lastInteractionRef = useRef<number>(Date.now());
  
  // Engine State
  const [options, setOptions] = useState<AsciiOptions>(VISUAL_PRESETS[0].options as AsciiOptions);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('ascii_pro_unlocked') === 'true');
  const [isHDEnabled, setIsHDEnabled] = useState(false);
  
  // UI Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
  const [isSharing, setIsSharing] = useState(false);

  const canvasRef = useRef<AsciiCanvasHandle>(null);

  // Auto-Reset Timer Logic
  useEffect(() => {
    if (!adminConfig.autoResetEnabled) return;
    
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastInteractionRef.current;
      if (idleTime > 30000 && appState !== 'landing') { 
        handleReset();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [appState, adminConfig.autoResetEnabled]);

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  const handleReset = () => {
    setAppState('landing');
    setCapturedSouvenir(null);
    trackEvent('session_reset');
  };

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(current => [...current, { id, message, type }]);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('ascii_pro_unlocked', 'true');
    addToast("Neural Link Upgraded // Pro Unlocked", "success");
    trackEvent('pro_unlock');
  };

  const handleStartCapture = () => {
    setAppState('countdown');
    recordInteraction();
  };

  const handleCaptureComplete = (souvenir: string) => {
    setCapturedSouvenir(souvenir);
    setAppState('review');
    recordInteraction();
  };

  const handleSurpriseMe = () => {
    const themes: any[] = ['pink', 'dreamy', 'noir', 'pastel', 'sparkle'];
    const filters: any[] = ['vintage', 'soft_pink', 'cool_blue', 'dreamy', 'paris_glow', 'seoul_dream', 'noir'];
    const densities: any[] = ['soft', 'airy', 'blocks', 'sparkle', 'premium_soft'];
    
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomFilter = filters[Math.floor(Math.random() * filters.length)];
    const randomDensity = densities[Math.floor(Math.random() * densities.length)];
    
    setOptions(prev => ({
      ...prev,
      theme: randomTheme,
      filter: randomFilter,
      density: randomDensity,
      colorMode: Math.random() > 0.5 ? 'color' : 'bw',
      brightness: 1.0,
      contrast: 1.0
    }));
  };

  const handleStyleCycle = () => {
    const nextIndex = (currentPresetIndex + 1) % VISUAL_PRESETS.length;
    setCurrentPresetIndex(nextIndex);
    setOptions(prev => ({ ...prev, ...VISUAL_PRESETS[nextIndex].options }));
    recordInteraction();
  };

  useEffect(() => {
    window.addEventListener('mousedown', recordInteraction);
    window.addEventListener('touchstart', recordInteraction);
    return () => {
      window.removeEventListener('mousedown', recordInteraction);
      window.removeEventListener('touchstart', recordInteraction);
    }
  }, [recordInteraction]);

  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [debugMetrics, setDebugMetrics] = useState({ fps: 0, processingTime: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsDeveloperMode(curr => !curr);
      addToast(isDeveloperMode ? "Developer Mode Disabled" : "Developer Mode Active ✨", "info");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 3000);
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen vintage-bg overflow-hidden selection:bg-[#c08a5d]/30 font-sans cursor-default">
      <div className="pattern-overlay" />
      <div className="grain-overlay" />
      
      <Toaster toasts={toasts} removeToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {/* MINIMAL DEVELOPER PANEL */}
      {isDeveloperMode && (
        <DebugPanel 
          isVisible={isDeveloperMode}
          fps={debugMetrics.fps}
          processingTime={debugMetrics.processingTime}
          filter={options.filter || 'none'}
          resolution={isHDEnabled ? '1080x1920' : '720x1280'}
          isRecording={canvasRef.current?.isRecording || false}
        />
      )}

      <Routes>
        <Route path="/explore" element={<ExploreGallery />} />
        <Route path="/my" element={<Dashboard />} />
        <Route path="/" element={
          <div className="relative w-full h-full flex flex-col items-center">
            {appState === 'landing' ? (
              <LandingScreen onStart={() => setAppState('live')} isLoading={false} error={null} />
            ) : (
              <div className="w-full h-full relative flex flex-col">
                {/* Minimal Header */}
                <header className="absolute top-0 left-0 w-full p-6 md:p-10 z-[150] flex justify-between items-center pointer-events-none">
                  <div 
                    className="pointer-events-auto cursor-pointer select-none group"
                    onMouseDown={startLongPress}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    onTouchStart={startLongPress}
                    onTouchEnd={endLongPress}
                  >
                    <span className="text-2xl font-serif tracking-[0.3em] text-[#6f4e37] uppercase opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-sm font-bold">
                        FACETOCODE.
                    </span>
                  </div>

                  <button 
                    onClick={() => setIsNavOpen(true)}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-[#c08a5d]/10 backdrop-blur-xl border border-[#c08a5d]/20 rounded-full shadow-sm text-[#6f4e37] hover:bg-[#c08a5d] hover:text-white transition-all hover:scale-110 active:scale-95"
                  >
                     <Grid className="w-5 h-5" />
                  </button>
                </header>

                <NavSheet isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

                <main className="w-full h-full relative flex flex-col items-center justify-center">
                  <AsciiCanvas 
                    ref={canvasRef}
                    options={options}
                    setOptions={setOptions}
                    onCamerasDiscovered={setCameras}
                    selectedCameraId={selectedCameraId}
                    isUnlocked={isUnlocked}
                    isHDEnabled={isHDEnabled}
                    onCaptureComplete={handleCaptureComplete}
                    runCountdown={appState === 'countdown'}
                    adminConfig={adminConfig}
                  />

                  {appState === 'live' && (
                    <ControlBar 
                      onCapture={handleStartCapture}
                      onSelectPreset={(idx) => {
                        setCurrentPresetIndex(idx);
                        setOptions(prev => ({ ...prev, ...VISUAL_PRESETS[idx].options }));
                      }}
                      onCycleStyle={handleStyleCycle}
                      onToggleRecording={() => canvasRef.current?.toggleRecording()}
                      isRecording={canvasRef.current?.isRecording || false}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                      currentPresetIndex={currentPresetIndex}
                    />
                  )}

                  {appState === 'review' && capturedSouvenir && (
                    <div className="absolute inset-0 z-[200] bg-[#f5e9dc]/80 backdrop-blur-xl flex items-center justify-center p-8">
                       <div className="max-w-xl w-full flex flex-col items-center gap-10 text-center animate-in zoom-in duration-700">
                          <h2 className="text-4xl font-serif font-bold tracking-tight text-[#6f4e37] leading-tight uppercase">Fragment Captured ✨</h2>
                          <div className="p-4 bg-white/40 shadow-2xl rounded-[32px] border border-white/40 rotate-[-1deg] hover:rotate-0 transition-transform duration-500 overflow-hidden">
                             <img src={capturedSouvenir} className="w-full h-auto rounded-[24px]" alt="Souvenir" />
                          </div>
                          <div className="flex gap-4 w-full">
                             <button onClick={() => setAppState('live')} className="flex-1 py-5 rounded-full bg-white/50 border border-white/20 text-[#6f4e37] font-medium uppercase tracking-widest transition-all hover:bg-white shadow-sm">Retake</button>
                             <button onClick={() => setAppState('delivery')} className="flex-[1.5] py-5 px-12 rounded-full bg-[#c08a5d] text-white font-bold uppercase tracking-widest transition-all hover:bg-[#8b5e3c] shadow-lg">Keep Magic ✨</button>
                          </div>
                       </div>
                    </div>
                  )}

                  {appState === 'delivery' && capturedSouvenir && (
                    <DeliveryScreen 
                      souvenir={capturedSouvenir} 
                      onReset={handleReset} 
                      onShare={() => canvasRef.current?.share() as Promise<string | undefined>} 
                      addToast={addToast}
                    />
                  )}
                </main>

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
                  isRecording={false}
                  onToggleRecording={() => {}}
                  onAnalyzeFeed={() => {}}
                  isAnalyzingCaption={false}
                />

                <AdminPanel 
                  isOpen={isAdminOpen} 
                  onClose={() => setIsAdminOpen(false)} 
                  config={adminConfig} 
                  setConfig={setAdminConfig} 
                />
              </div>
            )}
          </div>
        } />
      </Routes>
    </div>
  );
};

export default App;