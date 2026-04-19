export type AestheticFilter = 'none' | 'soft_pink' | 'warm_brown' | 'film' | 'mono_soft' | 'sage';
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
  density: 'soft' | 'airy' | 'binary' | 'blocks' | 'sparkle' | 'premium_soft' | 'ultra_soft';
  resolution: number; 
  theme: 'pink' | 'dreamy' | 'noir' | 'pastel' | 'sparkle' | 'none';
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
  soft: " .:-=+*#",
  airy: " .:+*",
  binary: " 01",
  blocks: " ░▒▓█",
  sparkle: " .·:+*", 
  premium_soft: " . · : * +",
  ultra_soft: "  .  ·  ",
  dusky: " .:-=+*"
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
    id: 'soft_pink', 
    name: 'soft pink', 
    icon: '🌸',
    options: { lightMode: true, theme: 'pink', colorMode: 'color', density: 'ultra_soft', fontSize: 13, resolution: 0.12, contrast: 0.8, brightness: 1.2, filter: 'soft_pink' } 
  },
  { 
    id: 'warm_brown', 
    name: 'warm brown', 
    icon: '☕',
    options: { lightMode: true, theme: 'none', colorMode: 'bw', density: 'dusky', fontSize: 11, resolution: 0.18, contrast: 1.0, brightness: 1.1, filter: 'warm_brown' } 
  },
  { 
    id: 'film', 
    name: 'film', 
    icon: '🎞',
    options: { lightMode: true, theme: 'none', colorMode: 'color', density: 'soft', fontSize: 10, resolution: 0.22, contrast: 1.1, brightness: 0.9, filter: 'film' } 
  },
  { 
    id: 'mono_soft', 
    name: 'mono soft', 
    icon: '🖤',
    options: { lightMode: false, theme: 'noir', colorMode: 'bw', density: 'soft', fontSize: 12, resolution: 0.15, contrast: 0.9, brightness: 1.0, filter: 'mono_soft' } 
  },
  { 
    id: 'sage', 
    name: 'sage', 
    icon: '🌿',
    options: { lightMode: true, theme: 'none', colorMode: 'color', density: 'soft', fontSize: 11, resolution: 0.18, contrast: 0.85, brightness: 1.15, filter: 'sage' } 
  }
];