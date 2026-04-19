export type AestheticFilter = 'none' | 'vintage' | 'soft_pink' | 'cool_blue' | 'dreamy' | 'paris_glow' | 'seoul_dream' | 'noir';
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
  ultra_soft: "  .  ·  "
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
  options: Partial<AsciiOptions>;
}

export const VISUAL_PRESETS: VisualPreset[] = [
  { 
    id: 'seoul_dream', 
    name: 'Seoul Dream ☁️', 
    options: { lightMode: true, theme: 'dreamy', colorMode: 'color', density: 'ultra_soft', fontSize: 13, resolution: 0.12, contrast: 0.6, brightness: 1.3, filter: 'seoul_dream', backgroundColor: '#f3e8ff' } 
  },
  { 
    id: 'blush_vibe', 
    name: 'Blush Pink 🌸', 
    options: { lightMode: true, theme: 'pink', colorMode: 'color', density: 'premium_soft', fontSize: 11, resolution: 0.18, contrast: 0.7, brightness: 1.25, filter: 'paris_glow', backgroundColor: '#ffe4ec' } 
  },
  { 
    id: 'paris_glow', 
    name: 'Paris Glow 🌸', 
    options: { theme: 'pink', colorMode: 'color', density: 'premium_soft', fontSize: 10, resolution: 0.18, contrast: 0.75, brightness: 1.25, filter: 'paris_glow' } 
  },
  { 
    id: 'soft_pink', 
    name: 'Soft Pink ✨', 
    options: { theme: 'pink', colorMode: 'color', density: 'soft', fontSize: 10, resolution: 0.18, contrast: 0.9, brightness: 1.1 } 
  },
  { 
    id: 'noir_classic', 
    name: 'Noir 🎞️', 
    options: { theme: 'noir', colorMode: 'bw', density: 'soft', fontSize: 10, resolution: 0.20, contrast: 1.1, brightness: 1.0 } 
  },
  { 
    id: 'pastel_vibe', 
    name: 'Pastel 🎨', 
    options: { theme: 'pastel', colorMode: 'color', density: 'soft', fontSize: 9, resolution: 0.25, contrast: 0.85, brightness: 1.15 } 
  },
  { 
    id: 'sparkle_joy', 
    name: 'Sparkle ✨', 
    options: { theme: 'sparkle', colorMode: 'bw', density: 'sparkle', fontSize: 14, resolution: 0.15, contrast: 1.2, brightness: 1.05 } 
  }
];