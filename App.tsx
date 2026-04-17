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

import { PhotoboothState, AdminConfig, DEFAULT_ADMIN_CONFIG, VisualPreset, VISUAL_PRESETS, AsciiOptions } from './types';
import { AppState, CameraDevice } from './core/types';
// specialized components for the flow
import { DeliveryScreen } from './components/DeliveryScreen';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [appState, setAppState] = useState<PhotoboothState>('landing');
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

  const handleStartCapture = () => {
    setAppState('countdown');
    recordInteraction();
  };

  const handleCaptureComplete = (souvenir: string) => {
    setCapturedSouvenir(souvenir);
    setAppState('review');
    recordInteraction();
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
    <div className="relative w-full h-screen bg-white overflow-hidden selection:bg-pink-100 font-sans cursor-crosshair">
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
                    <Heart className="w-6 h-6 text-pink-400 fill-pink-100" />
                    <span className="text-2xl font-black tracking-tighter text-slate-900">facetocode<span className="text-pink-400">.</span></span>
                  </div>
                  
                  {appState === 'live' && (
                    <nav className="flex items-center gap-6 pointer-events-auto">
                      <Link to="/explore" className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-pink-500 transition-colors">Explore</Link>
                      <button onClick={handleReset} className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-red-400">Exit</button>
                    </nav>
                  )}
                </header>

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

                  {appState === 'review' && capturedSouvenir && (
                    <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-2xl flex items-center justify-center p-8">
                       <div className="max-w-xl w-full flex flex-col items-center gap-12 text-center animate-in zoom-in duration-500">
                          <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 leading-tight">Aesthetic Captured<span className="text-pink-400">.</span></h2>
                          <div className="p-4 bg-white shadow-2xl rounded-[2.5rem] border border-pink-100/50 rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                             <img src={capturedSouvenir} className="w-full h-auto rounded-[2rem]" alt="Souvenir" />
                          </div>
                          <div className="flex gap-4 w-full">
                             <button onClick={() => setAppState('live')} className="flex-1 py-6 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Retake</button>
                             <button onClick={() => setAppState('delivery')} className="flex-[1.5] py-6 px-12 rounded-full bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-pink-500 transition-all shadow-xl">Keep Magic</button>
                          </div>
                       </div>
                    </div>
                  )}

                  {appState === 'delivery' && capturedSouvenir && (
                    <DeliveryScreen 
                      souvenir={capturedSouvenir} 
                      onReset={handleReset} 
                      onShare={() => canvasRef.current?.share() as Promise<string | undefined>} 
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