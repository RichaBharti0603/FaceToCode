import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings, Camera, Image as ImageIcon, Info, Github } from 'lucide-react';

import { LandingScreen } from './components/LandingScreen';
import { AsciiCanvas } from './components/AsciiCanvas';

// Lazy load heavy components
const ExploreGallery = React.lazy(() => import('./components/ExploreGallery').then(module => ({ default: module.ExploreGallery })));
const SettingsPanel = React.lazy(() => import('./components/SettingsPanel').then(module => ({ default: module.SettingsPanel })));
const AboutTutorial = React.lazy(() => import('./components/AboutTutorial').then(module => ({ default: module.AboutTutorial })));


import logoImg from './assests/images/logo.png';


import { Toaster, Toast } from './components/Toaster';

const Header: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) return null; // Landing has its own specific header

  return (
    <header className="h-[64px] border-b border-border bg-bg-main px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {location.pathname !== '/camera' && (
          <Link to="/camera" className="text-primary hover:text-primary-dark transition-colors flex items-center gap-2 font-mono text-sm">
            <span className="text-lg">←</span> Back to Camera
          </Link>
        )}
        <div className="text-text-primary font-mono font-bold flex items-center gap-2 text-lg">
          <img src={logoImg} alt="FaceToCode Logo" className="h-[36px] md:h-[44px] w-auto drop-shadow-md" />
          <span className="text-text-muted">·</span>
          <span>
            {location.pathname === '/camera' ? 'Live ASCII Studio' : ''}
            {location.pathname === '/gallery' ? 'ASCII Gallery' : ''}
            {location.pathname === '/settings' ? 'Settings' : ''}
            {location.pathname === '/about' ? 'About & Tutorial' : ''}
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-2">
        <Link to="/camera" className={`btn-icon ${location.pathname === '/camera' ? 'text-primary' : ''}`} title="Camera">
          <Camera size={20} />
        </Link>
        <Link to="/gallery" className={`btn-icon ${location.pathname === '/gallery' ? 'text-primary' : ''}`} title="Gallery">
          <ImageIcon size={20} />
        </Link>
        <Link to="/settings" className={`btn-icon ${location.pathname === '/settings' ? 'text-primary' : ''}`} title="Settings">
          <Settings size={20} />
        </Link>
        <Link to="/about" className={`btn-icon ${location.pathname === '/about' ? 'text-primary' : ''}`} title="Tutorial">
          <Info size={20} />
        </Link>
        <a href="https://github.com/RichaBharti0603/FaceToCode" target="_blank" rel="noreferrer" className="btn-icon text-primary hover:text-accent hover:drop-shadow-[0_0_8px_var(--accent)] hover:-translate-y-[1px] transition-all" title="GitHub">
          <Github size={20} />
        </a>
      </nav>
    </header>
  );
};

const App: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(current => [...current, { id, message, type }]);
  };

  return (
    <div className="min-h-screen w-full bg-bg-main text-text-primary font-sans flex flex-col">
      <Toaster toasts={toasts} removeToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />
      
      <Header />
      
      <main className="flex-1 relative">
        <React.Suspense fallback={<div className="flex-1 flex items-center justify-center font-mono text-primary text-xl">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/camera" element={<AsciiCanvas addToast={addToast} />} />
            <Route path="/gallery" element={<ExploreGallery addToast={addToast} />} />
            <Route path="/settings" element={<SettingsPanel addToast={addToast} />} />
            <Route path="/about" element={<AboutTutorial />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
};

export default App;