import { AsciiOptions } from '../types';

export type AsciiFrame = {
  chars: string[][];
  width: number;
  height: number;
  brightness: Float32Array;
  colors?: Uint8ClampedArray;
};

export type RendererMode = 'canvas' | 'webgl';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface EngineEvents {
  onFrame: (frame: AsciiFrame) => void;
  onStateChange: (state: 'idle' | 'running' | 'error') => void;
  onCamerasDiscovered: (cameras: CameraDevice[]) => void;
}
