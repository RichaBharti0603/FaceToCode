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
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-10 max-h-[90vh] overflow-y-auto text-slate-600 font-sans">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-12">
          {/* Feed Switcher */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-slate-900">
              <Camera className="w-4 h-4 opacity-50" />
              <label className="text-[10px] uppercase font-bold tracking-[0.2em]">Select Camera</label>
            </div>
            <select 
              value={selectedCameraId}
              onChange={(e) => onSelectCamera(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs outline-none focus:border-pink-300 transition-all"
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
                <div className="flex items-center gap-3 text-slate-900">
                  <Type className="w-4 h-4 opacity-50" />
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em]">Font Size</label>
                </div>
                <span className="text-[10px] opacity-40 font-mono">{options.fontSize}px</span>
              </div>
              <input 
                type="range" min="4" max="32" step="1"
                value={options.fontSize} 
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                className="w-full bg-slate-100 h-1 rounded-full appearance-none accent-slate-900 cursor-pointer"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <Zap className="w-4 h-4 opacity-50 text-pink-400" />
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em]">Detail</label>
                </div>
                <span className="text-[10px] opacity-40 font-mono">{(options.resolution * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0.05" max="0.5" step="0.01"
                value={options.resolution} 
                onChange={(e) => handleChange('resolution', Number(e.target.value))}
                className="w-full bg-slate-100 h-1 rounded-full appearance-none accent-slate-900 cursor-pointer"
              />
            </section>
          </div>

          <hr className="border-slate-50" />

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsToggle 
                label="Auto Magic" 
                active={options.autoEmotion} 
                onClick={() => handleChange('autoEmotion', !options.autoEmotion)}
                icon={<Brain className="w-4 h-4 text-pink-400" />}
            />
            <SettingsToggle 
                label="HD Uplink" 
                active={isHDEnabled} 
                onClick={() => setIsHDEnabled(!isHDEnabled)}
                icon={<Zap className="w-4 h-4 text-yellow-500" />}
            />
          </div>

          {/* Primary Actions */}
          <div className="space-y-4">
             <button 
                onClick={onToggleRecording}
                className={`w-full py-4 rounded-3xl border flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-[10px] transition-all ${isRecording ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'}`}
             >
                <Circle className={`w-3 h-3 ${isRecording ? 'fill-white animate-pulse' : 'text-red-400'}`} />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
             </button>
          </div>

          {!isUnlocked && (
            <div className="mt-10 p-8 bg-pink-50 rounded-[2rem] border border-pink-100 text-center">
                <h3 className="text-slate-900 font-bold mb-2 text-sm uppercase tracking-widest">Aesthetic Pro</h3>
                <p className="text-[10px] text-slate-450 mb-6 uppercase tracking-widest leading-relaxed">Unlock infinite resolution, no watermarks, and exclusive modes.</p>
                <button 
                    onClick={() => initiateProCheckout(onUnlock)}
                    className="w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                    Upgrade Now
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
        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${active ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
        </div>
        <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-pink-400' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${active ? 'left-6' : 'left-1'}`} />
        </div>
    </button>
);
