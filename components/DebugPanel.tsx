import React, { useState, useEffect } from 'react';

interface DebugPanelProps {
  isVisible: boolean;
  fps: number;
  processingTime: number;
  filter: string;
  resolution: string;
  isRecording: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  isVisible, 
  fps, 
  processingTime, 
  filter, 
  resolution, 
  isRecording 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-6 z-[200] w-64 glass-panel rounded-2xl p-4 pointer-events-auto border border-white/40 shadow-2xl animate-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col gap-3 font-mono text-[10px] text-gray-600 lowercase">
        <div className="flex justify-between border-b border-gray-100 pb-2 mb-1">
          <span className="font-bold text-pink-400">Developer Mode ✨</span>
          <span className="opacity-40">v2.1.0-AESTHETIC</span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          <span className="opacity-50">Frame Rate:</span>
          <span className="text-right font-bold">{fps} fps</span>
          
          <span className="opacity-50">Proc Time:</span>
          <span className="text-right font-bold">{processingTime.toFixed(1)}ms</span>
          
          <span className="opacity-50">Resolution:</span>
          <span className="text-right font-bold">{resolution}</span>
          
          <span className="opacity-50">Active Filter:</span>
          <span className="text-right font-bold text-pink-500">{filter}</span>
          
          <span className="opacity-50">Recording:</span>
          <span className="text-right font-bold text-gray-900">{isRecording ? 'active' : 'idle'}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 text-[8px] opacity-40 leading-tight">
          performance values are approximated based on local render cycle.
        </div>
      </div>
    </div>
  );
};
