import React from 'react';
import { X, Shield, Camera, Clock, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { AdminConfig } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdminConfig;
  setConfig: (config: AdminConfig) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, config, setConfig }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof AdminConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
             <Shield className="w-5 h-5 text-pink-500" />
             <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">Admin Control</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Countdown Duration */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 text-slate-900">
                <Clock className="w-4 h-4 opacity-30" />
                <label className="text-[10px] uppercase font-black tracking-widest">Countdown (Sec)</label>
             </div>
             <div className="flex gap-2">
                {[3, 5, 10].map(val => (
                   <button 
                     key={val}
                     onClick={() => handleChange('countdownDuration', val)}
                     className={`flex-1 py-4 rounded-2xl border font-bold text-xs transition-all ${config.countdownDuration === val ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                   >
                     {val}s
                   </button>
                ))}
             </div>
          </section>

          {/* Layout Type */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 text-slate-900">
                <LayoutGrid className="w-4 h-4 opacity-30" />
                <label className="text-[10px] uppercase font-black tracking-widest">Session Layout</label>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => handleChange('layoutType', 'single')}
                  className={`flex-1 p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${config.layoutType === 'single' ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                   <div className="w-8 h-8 rounded bg-white border border-current opacity-30 shadow-sm" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Single</span>
                </button>
                <button 
                  onClick={() => handleChange('layoutType', 'strip')}
                  className={`flex-1 p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${config.layoutType === 'strip' ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                   <div className="w-6 h-10 rounded-sm bg-white border border-current opacity-30 shadow-sm flex flex-col gap-0.5 p-0.5">
                      <div className="w-full h-1/3 bg-slate-100" />
                      <div className="w-full h-1/3 bg-slate-100" />
                      <div className="w-full h-1/3 bg-slate-100" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">3-Strip</span>
                </button>
             </div>
          </section>

          <hr className="border-slate-50" />

          {/* Toggles */}
          <div className="grid grid-cols-1 gap-4">
             <AdminToggle 
                label="Watermark" 
                active={config.watermarkEnabled} 
                onClick={() => handleChange('watermarkEnabled', !config.watermarkEnabled)} 
             />
             <AdminToggle 
                label="Auto Reset" 
                active={config.autoResetEnabled} 
                onClick={() => handleChange('autoResetEnabled', !config.autoResetEnabled)} 
             />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
           <button 
             onClick={onClose}
             className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-105 transition-all active:scale-95"
           >
             Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

const AdminToggle: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${active ? 'bg-pink-50 border-pink-100 text-pink-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
    >
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {active ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
    </button>
);
