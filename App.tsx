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

  const adminTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startAdminTimer = () => {
    adminTimerRef.current = setTimeout(() => {
      setIsAdminOpen(true);
      addToast("Admin Console Authorized");
    }, 3000);
  };

  const clearAdminTimer = () => {
    if (adminTimerRef.current) {
      clearTimeout(adminTimerRef.current);
      adminTimerRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-soft-pink overflow-hidden selection:bg-pink-100 font-sans cursor-crosshair">
      <div className="grain-overlay" />
      
      {/* Aesthetic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-200/30 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-orange-100/40 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '4s' }} />

      <Toaster toasts={toasts} removeToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      <Routes>
        <Route path="/explore" element={<ExploreGallery />} />
        <Route path="/my" element={<Dashboard />} />
        <Route path="/" element={
          <div className="relative w-full h-full flex flex-col">
            {appState === 'landing' ? (
              <LandingScreen onStart={() => setAppState('live')} isLoading={false} error={null} />
            ) : (
              <div className="w-full h-full relative">
                {/* Product Header */}
                <header className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-center pointer-events-none">
                  <div 
                    className="flex items-center gap-3 pointer-events-auto cursor-help select-none"
                    onMouseDown={startAdminTimer}
                    onMouseUp={clearAdminTimer}
                    onMouseLeave={clearAdminTimer}
                    onTouchStart={startAdminTimer}
                    onTouchEnd={clearAdminTimer}
                  >
                    <Heart className="w-5 h-5 text-rose-300 fill-rose-100" />
                    <span className="text-2xl font-black tracking-tighter text-slate-900 lowercase">facetocode.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                      onClick={handleSurpriseMe}
                      className="h-14 px-8 flex items-center justify-center bg-gradient-to-r from-rose-300 to-rose-400 text-white font-black rounded-full shadow-[0_15px_40px_rgba(244,63,94,0.15)] hover:scale-105 active:scale-95 transition-all text-xs tracking-[0.2em] uppercase"
                      title="Surprise Me"
                    >
                       Surprise Me 🎀
                    </button>

                    <button 
                      onClick={() => setIsNavOpen(true)}
                      className="w-14 h-14 flex items-center justify-center bg-white/40 backdrop-blur-2xl border border-white/50 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-slate-900 hover:bg-white/60 transition-all hover:scale-105 active:scale-95"
                      title="Open Navigation"
                    >
                       <Grid className="w-6 h-6 text-pink-500" />
                    </button>
                  </div>
                </header>

                <NavSheet isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
                <CreativeSheet 
                  isOpen={isCreativeSheetOpen} 
                  onClose={() => setIsCreativeSheetOpen(false)} 
                  options={options}
                  setOptions={setOptions}
                />

                <main className="w-full h-full relative bg-pink-50/20">
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
                    <CreativeToolbar 
                      options={options} 
                      setOptions={setOptions} 
                      onOpenCreativeSheet={() => setIsCreativeSheetOpen(true)} 
                    />
                  )}

                  {appState === 'review' && capturedSouvenir && (
                    <div className="absolute inset-0 z-[100] bg-white/40 backdrop-blur-3xl flex items-center justify-center p-8">
                       <div className="max-w-xl w-full flex flex-col items-center gap-10 text-center animate-in zoom-in duration-700">
                          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight lowercase">magic fragment captured<span className="text-rose-300"> 💌</span></h2>
                          <div className="p-4 bg-white shadow-2xl rounded-[2.5rem] border border-pink-100/50 rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                             <img src={capturedSouvenir} className="w-full h-auto rounded-[2rem]" alt="Souvenir" />
                          </div>
                          <div className="flex gap-4 w-full">
                             <button onClick={() => setAppState('live')} className="flex-1 py-6 rounded-full bg-white/50 border border-white text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all">Retake</button>
                             <button onClick={() => setAppState('delivery')} className="flex-[1.5] py-6 px-12 rounded-full bg-slate-900 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-rose-500 transition-all shadow-xl">Keep Magic ✨</button>
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

                {appState === 'live' && (
                  <ControlBar 
                    onCapture={handleStartCapture}
                    onCycleStyle={handleStyleCycle}
                    onToggleRecording={() => canvasRef.current?.toggleRecording()}
                    isRecording={canvasRef.current?.isRecording || false}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    currentPresetName={VISUAL_PRESETS[currentPresetIndex].name}
                  />
                )}

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