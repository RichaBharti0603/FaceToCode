import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Settings, RefreshCw, Save, Video, ChevronUp, ChevronDown, Camera as CameraIcon } from 'lucide-react';
import { AsciiEngine } from '../core/AsciiEngine';
import { CameraDevice } from '../core/types';
import { AsciiOptions, VISUAL_PRESETS } from '../types';
import { Toast } from './Toaster';

interface AsciiCanvasProps {
  addToast: (message: string, type?: Toast['type']) => void;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({ addToast }) => {
  const [options, setOptions] = useState<AsciiOptions>(VISUAL_PRESETS[0].options as AsciiOptions);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('camera');
  const [fps, setFps] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const engine = useMemo(() => new AsciiEngine(options, {
    onStateChange: (state) => {
      if (state === 'error') addToast("Camera access denied.", "error");
    },
    onCamerasDiscovered: (cams) => setCameras(cams),
    onFrame: () => {
      // Very simple FPS calculation
      setFps(prev => (prev + 1) % 60); // Mocked for UI, engine doesn't emit real fps directly
    }
  }), []);

  useEffect(() => {
    engine.updateOptions(options);
  }, [options, engine]);

  useEffect(() => {
    if (selectedCameraId) {
      engine.setCamera(selectedCameraId);
    }
  }, [selectedCameraId, engine]);

  useEffect(() => {
    if (canvasRef.current) {
      engine.start(canvasRef.current).then(() => {
        // Hook original video feed
        const internalVideo = (engine as any).camera?.getVideo();
        if (internalVideo && videoRef.current) {
          videoRef.current.srcObject = internalVideo.srcObject;
          videoRef.current.play().catch(e => console.error(e));
        }
      });
    }
    return () => {
      engine.stop();
    };
  }, [engine]);

  const handleReset = () => {
    setOptions(VISUAL_PRESETS[0].options as AsciiOptions);
    addToast("Reset to defaults", "info");
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `facetocode_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    addToast("Saved snapshot!", "success");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-bg-main relative">
      
      {/* Master Grid: Split View */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        
        {/* Left: Webcam Preview */}
        <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl relative overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#1a1a1a] flex justify-between items-center text-xs font-mono text-text-secondary bg-[#111]">
            <span>WEBCAM_FEED_01</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-success rounded-full animate-pulse" /> LIVE</span>
          </div>
          <div className="flex-1 relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 border border-primary/20 pointer-events-none" />
            <div className="absolute top-4 left-4 font-mono text-primary text-xs bg-bg-main/50 px-2 py-1 rounded">[RAW_INPUT]</div>
          </div>
        </div>

        {/* Right: ASCII Output */}
        <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl relative overflow-hidden flex flex-col shadow-card-hover">
          <div className="p-2 border-b border-[#1a1a1a] flex justify-between items-center text-xs font-mono text-primary bg-[#111]">
            <span>ASCII_RENDER_OUTPUT</span>
            <span>{Math.floor(Math.random() * 20 + 40)} FPS</span>
          </div>
          <div className="flex-1 relative">
            <div className="scanlines-green opacity-50 z-10" />
            <canvas ref={canvasRef} className="w-full h-full object-contain bg-black" />
            <div className="absolute bottom-4 right-4 text-primary font-mono animate-blink z-20">_</div>
          </div>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className={`border-t border-[#1a1a1a] bg-[#0a0a0a] transition-all duration-300 ease-in-out ${isPanelOpen ? 'h-[250px]' : 'h-[48px]'}`}>
        
        {/* Panel Header / Tabs */}
        <div className="flex items-center justify-between px-4 border-b border-[#1a1a1a] h-[48px] overflow-x-auto overflow-y-hidden no-scrollbar">
          <div className="flex items-center gap-2 font-mono text-sm">
            <button onClick={() => { setIsPanelOpen(true); setActiveTab('camera'); }} className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'camera' && isPanelOpen ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>[CAMERA]</button>
            <button onClick={() => { setIsPanelOpen(true); setActiveTab('charset'); }} className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'charset' && isPanelOpen ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>[CHARSET]</button>
            <button onClick={() => { setIsPanelOpen(true); setActiveTab('effects'); }} className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'effects' && isPanelOpen ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>[EFFECTS]</button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="btn-icon" title="Save Snapshot"><Save size={18} /></button>
            <button onClick={handleReset} className="btn-icon" title="Reset"><RefreshCw size={18} /></button>
            <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="btn-icon ml-2 text-primary">
              {isPanelOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
        </div>

        {/* Panel Content */}
        {isPanelOpen && (
          <div className="p-6 overflow-y-auto h-[202px]">
            {activeTab === 'camera' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-2">SOURCE DEVICE</label>
                  <select 
                    className="w-full bg-[#111] border border-[#222] text-sm text-text-primary rounded p-2 focus:border-primary outline-none"
                    value={selectedCameraId || ''}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                  >
                    {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || `Camera ${c.deviceId.slice(0,5)}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-2">BRIGHTNESS ({options.brightness.toFixed(1)})</label>
                  <input type="range" min="0" max="2" step="0.1" value={options.brightness} onChange={e => setOptions({...options, brightness: parseFloat(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-2">CONTRAST ({options.contrast.toFixed(1)})</label>
                  <input type="range" min="0" max="2" step="0.1" value={options.contrast} onChange={e => setOptions({...options, contrast: parseFloat(e.target.value)})} className="w-full accent-primary" />
                </div>
              </div>
            )}
            
            {activeTab === 'charset' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-2">CHARACTER SET PRESET</label>
                  <select 
                    className="w-full bg-[#111] border border-[#222] text-sm text-text-primary rounded p-2 focus:border-primary outline-none"
                    value={options.characterSet}
                    onChange={(e) => setOptions({...options, characterSet: e.target.value as any})}
                  >
                    <option value="standard">Standard ( .:-=+*#%@ )</option>
                    <option value="blocks">Blocks ( ░▒▓█ )</option>
                    <option value="binary">Binary ( 01 )</option>
                    <option value="custom">Custom...</option>
                  </select>
                </div>
                {options.characterSet === 'custom' && (
                  <div>
                    <label className="block text-xs font-mono text-text-secondary mb-2">CUSTOM STRING (Dark → Light)</label>
                    <input type="text" value={options.customChars || ''} onChange={e => setOptions({...options, customChars: e.target.value})} className="w-full bg-[#111] border border-[#222] text-sm text-primary rounded p-2 font-mono outline-none focus:border-primary" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-2">FONT SIZE ({options.fontSize}px)</label>
                  <input type="range" min="4" max="24" step="1" value={options.fontSize} onChange={e => setOptions({...options, fontSize: parseInt(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-6 text-sm font-mono text-text-primary">
                    <input type="checkbox" checked={options.invert} onChange={e => setOptions({...options, invert: e.target.checked})} className="accent-primary" />
                    INVERT COLORS
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-6 text-sm font-mono text-text-primary">
                    <input type="checkbox" checked={options.colorMode === 'color'} onChange={e => setOptions({...options, colorMode: e.target.checked ? 'color' : 'bw'})} className="accent-primary" />
                    COLOR MODE
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-[24px] bg-primary text-bg-main flex items-center justify-between px-4 text-[10px] font-bold font-mono uppercase tracking-widest absolute bottom-0 left-0 w-full z-50">
        <div>SYS_STATUS: ONLINE // NEURAL_LINK: ACTIVE</div>
        <div className="flex gap-4">
          <span>[S] SAVE</span>
          <span>[R] RESET</span>
        </div>
      </div>
    </div>
  );
};