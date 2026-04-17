import React from 'react';
import { X, Camera, Zap, Sliders, Type, Monitor, Brain, Circle, Lock } from 'lucide-react';
import { AsciiOptions, DENSITY_MAPS } from '../types';
import { CameraDevice } from '../core/types';
import { playButtonSound } from '../utils/soundEffects';
import { initiateProCheckout } from '../services/paymentService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
  cameras: CameraDevice[];
  selectedCameraId?: string;
  onSelectCamera: (id: string) => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  isHDEnabled: boolean;
  setIsHDEnabled: (enabled: boolean) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onAnalyzeFeed: () => void;
  isAnalyzingCaption: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen, onClose, options, setOptions, cameras, selectedCameraId, 
  onSelectCamera, isUnlocked, onUnlock, isHDEnabled, setIsHDEnabled,
  isRecording, onToggleRecording, onAnalyzeFeed, isAnalyzingCaption
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof AsciiOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto text-green-500 font-mono">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">Advanced Protocol</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Feed Switcher */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-white">
              <Camera className="w-4 h-4 opacity-70" />
              <label className="text-xs uppercase font-bold tracking-widest">Feed Source</label>
            </div>
            <select 
              value={selectedCameraId}
              onChange={(e) => onSelectCamera(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs outline-none focus:border-green-500 transition-all"
            >
              {cameras.map(cam => (
                 <option key={cam.deviceId} value={cam.deviceId}>{cam.label}</option>
              ))}
            </select>
          </section>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-white">
                  <Type className="w-4 h-4 opacity-70" />
                  <label className="text-xs uppercase font-bold tracking-widest">Glyph Size</label>
                </div>
                <span className="text-[10px] opacity-70">{options.fontSize}px</span>
              </div>
              <input 
                type="range" min="4" max="32" step="1"
                value={options.fontSize} 
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                className="w-full bg-white/10 h-1 rounded-full appearance-none accent-green-500 cursor-pointer"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-white">
                  <Zap className="w-4 h-4 opacity-70" />
                  <label className="text-xs uppercase font-bold tracking-widest">Network Load</label>
                </div>
                <span className="text-[10px] opacity-70">{(options.resolution * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0.05" max="0.5" step="0.01"
                value={options.resolution} 
                onChange={(e) => handleChange('resolution', Number(e.target.value))}
                className="w-full bg-white/10 h-1 rounded-full appearance-none accent-green-500 cursor-pointer"
              />
            </section>
          </div>

          <hr className="border-white/5" />

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsToggle 
                label="Emotion Sync" 
                active={options.autoEmotion} 
                onClick={() => handleChange('autoEmotion', !options.autoEmotion)}
                icon={<Brain className="w-4 h-4" />}
            />
            <SettingsToggle 
                label="HD Uplink" 
                active={isHDEnabled} 
                onClick={() => setIsHDEnabled(!isHDEnabled)}
                icon={<Zap className="w-4 h-4 text-yellow-500" />}
            />
          </div>

          {/* Primary Actions (Hidden in main view) */}
          <div className="space-y-4">
             <button 
                onClick={onToggleRecording}
                className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all ${isRecording ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
             >
                <Circle className={`w-4 h-4 ${isRecording ? 'fill-white animate-pulse' : ''}`} />
                {isRecording ? 'Cease Recording' : 'Initiate HD Record'}
             </button>
             
             <button 
                onClick={onAnalyzeFeed}
                disabled={isAnalyzingCaption}
                className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20`}
             >
                <Monitor className={`w-4 h-4 ${isAnalyzingCaption ? 'animate-pulse' : ''}`} />
                Neural Assessment
             </button>
          </div>

          {!isUnlocked && (
            <div className="mt-10 p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 text-center">
                <h3 className="text-white font-black mb-2 uppercase tracking-tighter">Full Core Access</h3>
                <p className="text-[10px] text-white/50 mb-6 uppercase tracking-widest leading-relaxed italic">Unlock Pro Exports, Infinite Resilience, and Raw Neural Streams.</p>
                <button 
                    onClick={() => initiateProCheckout(onUnlock)}
                    className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest text-xs rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Unlock Protocol
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsToggle: React.FC<{ label: string; active?: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${active ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-white/5 border-white/10 text-white/50'}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
        </div>
        <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-white/10'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
        </div>
    </button>
);
