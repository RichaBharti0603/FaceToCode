import React from 'react';
import { AsciiOptions, DENSITY_MAPS } from '../types';
import { CameraDevice } from '../core/types';
import { Sliders, Monitor, Type, Palette, Zap, Camera, Brain } from 'lucide-react';
import { playButtonSound } from '../utils/soundEffects';
import { initiateProCheckout } from '../services/paymentService';
import { trackEvent } from '../services/analyticsService';

interface ControlPanelProps {
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
  cameras: CameraDevice[];
  selectedCameraId?: string;
  onSelectCamera: (id: string) => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  isHDEnabled: boolean;
  setIsHDEnabled: (enabled: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  options, 
  setOptions,
  cameras,
  selectedCameraId,
  onSelectCamera,
  isUnlocked,
  onUnlock,
  isHDEnabled,
  setIsHDEnabled
}) => {
  const handleChange = (key: keyof AsciiOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (key: keyof AsciiOptions, value: any) => {
      playButtonSound();
      handleChange(key, value);
      if (key === 'colorMode') trackEvent('emotion_mode_toggle', { mode: value });
  }

  const handleUnlockClick = () => {
    initiateProCheckout(onUnlock);
  };

  return (
    <div className="absolute bottom-0 w-full bg-black/80 border-t border-green-900/50 backdrop-blur-sm p-4 z-30 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-8 justify-center items-center text-green-500 text-xs font-mono">
        
        {/* Camera Selector */}
        {cameras.length > 0 && (
          <div className="flex flex-col gap-1 w-32">
            <div className="flex items-center gap-2 mb-1">
               <Camera className="w-3 h-3" />
               <label>FEED SRC</label>
            </div>
            <select 
              value={selectedCameraId || (cameras[0]?.deviceId)}
              onChange={(e) => {
                playButtonSound();
                onSelectCamera(e.target.value);
              }}
              className="bg-black border border-green-800 text-[10px] p-1 text-green-500 focus:border-green-500 outline-none"
            >
              {cameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label.length > 15 ? cam.label.slice(0, 15) + '...' : cam.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Font Size */}
        <div className="flex flex-col gap-1 w-32">
          <div className="flex items-center gap-2 mb-1">
             <Type className="w-3 h-3" />
             <label>GLYPH SIZE: {options.fontSize}px</label>
          </div>
          <input 
            type="range" 
            min="4" 
            max="32" 
            value={options.fontSize} 
            onChange={(e) => handleChange('fontSize', Number(e.target.value))}
            className="accent-green-500 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Resolution */}
        <div className="flex flex-col gap-1 w-32">
           <div className="flex items-center gap-2 mb-1">
             <Zap className="w-3 h-3" />
             <label>GRID DENSITY: {(options.resolution * 100).toFixed(0)}%</label>
           </div>
          <input 
            type="range" 
            min="0.02" 
            max="0.5" 
            step="0.01" 
            value={options.resolution} 
            onChange={(e) => handleChange('resolution', Number(e.target.value))}
            className="accent-green-500 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Brightness/Gain */}
        <div className="flex flex-col gap-1 w-24">
           <div className="flex items-center gap-2 mb-1">
             <Sliders className="w-3 h-3" />
             <label>GAIN: {options.brightness.toFixed(1)}</label>
           </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.5" 
            step="0.1" 
            value={options.brightness} 
            onChange={(e) => handleChange('brightness', Number(e.target.value))}
            className="accent-green-500 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Color Mode */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Palette className="w-3 h-3" />
                <span>CHROMA</span>
            </div>
            <div className="flex gap-1">
                {(['matrix', 'bw', 'retro', 'color'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange('colorMode', mode)}
                        className={`px-2 py-1 border ${options.colorMode === mode ? 'bg-green-500 text-black border-green-500' : 'bg-transparent border-green-800 text-green-700 hover:border-green-500'} text-[10px] uppercase transition-colors`}
                    >
                        {mode === 'color' ? 'RGB' : mode}
                    </button>
                ))}
            </div>
        </div>

        {/* Diversity Map (Charset) */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Monitor className="w-3 h-3" />
                <span>CHARSET</span>
            </div>
            <div className="flex gap-1">
                {(Object.keys(DENSITY_MAPS) as Array<keyof typeof DENSITY_MAPS>).map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange('density', mode)}
                        className={`px-2 py-1 border ${options.density === mode ? 'bg-green-500 text-black border-green-500' : 'bg-transparent border-green-800 text-green-700 hover:border-green-500'} text-[10px] uppercase transition-colors`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>

        {/* Emotion Sync Toggle */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Brain className={`w-3 h-3 ${options.autoEmotion ? 'text-blue-400' : ''}`} />
                <span>EMOTION SYNC</span>
            </div>
            <button
                onClick={() => handleChange('autoEmotion', !options.autoEmotion)}
                className={`px-3 py-1 border ${options.autoEmotion ? 'bg-blue-500 text-black border-blue-500' : 'bg-transparent border-green-800 text-green-700'} text-[10px] uppercase font-bold transition-all`}
            >
                {options.autoEmotion ? 'AUTO-MODE: ON' : 'MANUAL'}
            </button>
        </div>

        {/* Feature Gating: HD Mode & Pro Unlock */}
        <div className="flex gap-6 border-l border-green-900/30 pl-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Zap className={`w-3 h-3 ${isHDEnabled ? 'text-yellow-400' : ''}`} />
                    <span>HD MODE</span>
                </div>
                <button
                    onClick={() => setIsHDEnabled(!isHDEnabled)}
                    className={`px-3 py-1 border ${isHDEnabled ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-transparent border-green-800 text-green-700'} text-[10px] uppercase font-bold transition-all`}
                >
                    {isHDEnabled ? '1080P ACTIVE' : 'STANDARD'}
                </button>
            </div>

            {!isUnlocked && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/50">
                        <Zap className="w-3 h-3 group-hover:text-yellow-400" />
                        <span>PREMIUM</span>
                    </div>
                    <button
                        onClick={handleUnlockClick}
                        className="px-4 py-1 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[10px] font-black uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                    >
                        Unlock Pro (One-Off)
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};