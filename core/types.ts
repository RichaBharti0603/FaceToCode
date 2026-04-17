import { AsciiOptions } from './types';

export interface ProcessedFrame {
  chars: string[];      // Flat array of strings (one per row)
  gridWidth: number;    // Number of columns in character grid
  gridHeight: number;   // Number of rows in character grid
  pixelData: Uint8ClampedArray; // Downsampled pixel data for colors/analysis
}

export type RendererMode = 'canvas' | 'webgl';

export interface EngineEvents {
  onFrame: (frame: ProcessedFrame) => void;
  onStateChange: (state: 'idle' | 'running' | 'error') => void;
}
