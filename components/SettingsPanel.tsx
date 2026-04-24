import React, { useState } from 'react';
import { Toast } from './Toaster';

interface SettingsPanelProps {
  addToast: (message: string, type?: Toast['type']) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'camera', label: 'Camera & Input' },
    { id: 'ascii', label: 'ASCII Engine' },
    { id: 'perform', label: 'Performance' },
    { id: 'storage', label: 'Storage' },
    { id: 'export', label: 'Export Options' },
    { id: 'keyboard', label: 'Shortcuts' },
  ];

  const handleSave = () => {
    addToast("Settings saved to local storage.", "success");
  };

  const handleReset = () => {
    addToast("Settings reset to defaults.", "info");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-bg-main text-text-primary">
      
      {/* Sidebar Navigation */}
      <div className="w-[240px] border-r border-border bg-bg-surface flex flex-col p-4 overflow-y-auto">
        <h2 className="text-xs font-mono text-text-secondary uppercase mb-6 px-2">Settings</h2>
        <nav className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-mono transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}
            >
              [{tab.label}]
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            
            {/* Header */}
            <div className="mb-10 pb-4 border-b border-border">
               <h1 className="text-3xl font-bold font-mono tracking-tight capitalize text-white">
                  {tabs.find(t => t.id === activeTab)?.label}
               </h1>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h3 className="text-sm font-mono text-primary mb-4 border-l-2 border-primary pl-3">UI Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="border border-primary bg-primary/5 p-4 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-3">
                      <input type="radio" name="theme" defaultChecked className="accent-primary" /> 
                      <span className="font-mono text-sm">Terminal (Neon Green)</span>
                    </label>
                    <label className="border border-border bg-bg-surface p-4 rounded-xl cursor-pointer hover:border-[#6f4e37] transition-colors flex items-center gap-3 opacity-50">
                      <input type="radio" name="theme" disabled className="accent-primary" /> 
                      <span className="font-mono text-sm">Ethereal Vintage (Dep)</span>
                    </label>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-sm font-mono text-primary mb-4 border-l-2 border-primary pl-3">Sound Effects</h3>
                  <div className="flex flex-col gap-4 bg-bg-surface p-6 rounded-xl border border-border">
                    <label className="flex items-center justify-between cursor-pointer">
                       <span className="text-sm font-mono">UI Sounds (Clicks, Hover)</span>
                       <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                       <span className="text-sm font-mono">Shutter Sound</span>
                       <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                       <span className="text-sm font-mono">Ambient Hum</span>
                       <input type="checkbox" className="w-5 h-5 accent-primary" />
                    </label>
                  </div>
                </section>
              </div>
            )}

            {/* Camera Tab */}
            {activeTab === 'camera' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h3 className="text-sm font-mono text-primary mb-4 border-l-2 border-primary pl-3">Device Selection</h3>
                  <select className="w-full bg-[#111] border border-[#222] text-sm text-text-primary rounded-xl p-4 focus:border-primary outline-none font-mono">
                    <option>Loading devices...</option>
                  </select>
                </section>

                <section>
                  <h3 className="text-sm font-mono text-primary mb-4 border-l-2 border-primary pl-3">Image Processing</h3>
                  <div className="space-y-6 bg-bg-surface p-6 rounded-xl border border-border">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-text-secondary mb-2">
                        <span>Exposure Comp.</span>
                        <span>0.0 EV</span>
                      </div>
                      <input type="range" min="-2" max="2" step="0.1" defaultValue="0" className="w-full accent-primary" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono text-text-secondary mb-2">
                        <span>Mirror Output</span>
                        <span>ON</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ASCII Engine Tab */}
            {activeTab === 'ascii' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h3 className="text-sm font-mono text-primary mb-4 border-l-2 border-primary pl-3">Resolution & Density</h3>
                  <div className="space-y-6 bg-bg-surface p-6 rounded-xl border border-border">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-text-secondary mb-2">
                        <span>Target Columns</span>
                        <span>120 chars</span>
                      </div>
                      <input type="range" min="40" max="300" step="10" defaultValue="120" className="w-full accent-primary" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono text-text-secondary mb-2">
                        <span>Line Height Ratio</span>
                        <span>1.0</span>
                      </div>
                      <input type="range" min="0.5" max="2.0" step="0.1" defaultValue="1.0" className="w-full accent-primary" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-mono text-primary mb-4 border-l-2 border-primary pl-3">Advanced Customization</h3>
                  <div className="space-y-4">
                    <label className="block text-xs font-mono text-text-secondary mb-2">Fallback Character Set</label>
                    <input type="text" defaultValue=" .:-=+*#%@" className="w-full bg-[#111] border border-[#222] text-sm text-primary rounded-xl p-4 font-mono outline-none focus:border-primary" />
                  </div>
                </section>
              </div>
            )}

            {/* Other tabs can be similarly mocked for now */}
            {['perform', 'storage', 'export', 'keyboard'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted font-mono animate-fade-in border border-dashed border-border rounded-xl bg-bg-surface/50">
                 <div className="text-4xl mb-4">⚙️</div>
                 <p>Options for [{activeTab.toUpperCase()}]</p>
                 <p className="text-xs mt-2 opacity-50">This section is currently under construction.</p>
              </div>
            )}

          </div>
        </div>

        {/* Global Save/Reset Footer */}
        <div className="h-[80px] bg-bg-surface border-t border-border flex items-center justify-end px-8 gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
           <button onClick={handleReset} className="btn-secondary">Reset to Defaults</button>
           <button onClick={handleSave} className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
