export interface AsciiOptions {
  fontSize: number;
  brightness: number;
  contrast: number;
  colorMode: 'bw' | 'color';
  density: 'soft' | 'airy' | 'binary' | 'blocks' | 'sparkle';
  resolution: number; 
  theme: 'pink' | 'dreamy' | 'noir' | 'pastel' | 'sparkle' | 'none';
  autoEmotion?: boolean;
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
  layoutType: 'strip',
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
    id: 'soft_pink', 
    name: 'Soft Pink ✨', 
    options: { theme: 'pink', colorMode: 'color', density: 'soft', fontSize: 10, resolution: 0.18, contrast: 0.9, brightness: 1.1 } 
  },
  { 
    id: 'dreamy_cloud', 
    name: 'Dreamy ☁️', 
    options: { theme: 'dreamy', colorMode: 'color', density: 'airy', fontSize: 12, resolution: 0.12, contrast: 0.8, brightness: 1.2 } 
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