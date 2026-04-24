export type AestheticFilter = 'none' | 'matrix' | 'hacker' | 'cyberpunk' | 'ghost';
export type CaptureMode = 'photo' | 'gif';

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface DoodlePoint {
  x: number;
  y: number;
}

export interface AsciiOptions {
  fontSize: number;
  brightness: number;
  contrast: number;
  colorMode: 'bw' | 'color';
  characterSet: 'standard' | 'blocks' | 'binary' | 'custom';
  customChars?: string;
  invert?: boolean;
  resolution: number; 
  theme: 'neon' | 'dark' | 'amber' | 'none';
  autoEmotion?: boolean;
  filter?: AestheticFilter;
  captureMode?: CaptureMode;
  showDateStamp?: boolean;
  showFilmBorder?: boolean;
  stickers?: Sticker[];
  doodlePaths?: DoodlePoint[][];
  memeTextTop?: string;
  memeTextBottom?: string;
  lightMode?: boolean;
  backgroundColor?: string;
}

export interface AnalysisResult {
  description: string;
  tags: string[];
  threatLevel: string;
}

export const DENSITY_MAPS = {
  standard: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
  custom: " .:-=+*#%@"
};

export type PhotoboothState = 'landing' | 'live' | 'countdown' | 'review' | 'delivery';

export interface AdminConfig {
  countdownDuration: number;
  photosPerSession: number;
  layoutType: 'single' | 'strip';
  watermarkEnabled: boolean;
  autoResetEnabled: boolean;
}

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  countdownDuration: 3,
  photosPerSession: 3,
  layoutType: 'single',
  watermarkEnabled: true,
  autoResetEnabled: true
};

export interface VisualPreset {
  id: string;
  name: string;
  icon: string;
  options: Partial<AsciiOptions>;
}

export const VISUAL_PRESETS: VisualPreset[] = [
  { 
    id: 'terminal_green', 
    name: 'TERMINAL_GREEN', 
    icon: '💻',
    options: { lightMode: false, theme: 'neon', colorMode: 'bw', characterSet: 'standard', fontSize: 10, resolution: 0.2, contrast: 1.2, brightness: 1.0, filter: 'matrix', invert: false } 
  },
  { 
    id: 'binary_core', 
    name: 'BINARY_CORE', 
    icon: '01',
    options: { lightMode: false, theme: 'neon', colorMode: 'bw', characterSet: 'binary', fontSize: 8, resolution: 0.25, contrast: 1.5, brightness: 1.0, filter: 'hacker', invert: false } 
  },
  { 
    id: 'cyberpunk_glow', 
    name: 'CYBERPUNK_GLOW', 
    icon: '🌆',
    options: { lightMode: false, theme: 'neon', colorMode: 'color', characterSet: 'blocks', fontSize: 12, resolution: 0.15, contrast: 1.1, brightness: 1.1, filter: 'cyberpunk', invert: false } 
  }
];