import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings, Camera, Image as ImageIcon, Info, Github } from 'lucide-react';

// New Feature Views
import { LandingScreen } from './components/LandingScreen';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ExploreGallery } from './components/ExploreGallery';
import { SettingsPanel } from './components/SettingsPanel';
import { AboutTutorial } from './components/AboutTutorial';

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
          <span className="text-primary">FaceToCode</span>
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
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/camera" element={<AsciiCanvas addToast={addToast} />} />
          <Route path="/gallery" element={<ExploreGallery addToast={addToast} />} />
          <Route path="/settings" element={<SettingsPanel addToast={addToast} />} />
          <Route path="/about" element={<AboutTutorial />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;