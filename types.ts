export interface AsciiOptions {
  fontSize: number;
  brightness: number;
  contrast: number;
  colorMode: 'matrix' | 'bw' | 'color' | 'retro';
  density: 'simple' | 'complex' | 'binary' | 'blocks' | 'matrix';
  resolution: number; // Downscaling factor (0.1 - 1.0)
  autoEmotion?: boolean;
}

export interface AnalysisResult {
  description: string;
  tags: string[];
  threatLevel: string;
}

export const DENSITY_MAPS = {
  simple: " .:-=+*#%@",
  // User requested characters <.!@#$%^&*, sorted by visual density for smoothness
  // Original order was keyboard layout which causes flickering
  complex: " .^!*<&%$#@", 
  binary: " 01",
  blocks: " ░▒▓█",
  matrix: "01", // Binary charset as requested
};

export interface VisualPreset {
  id: string;
  name: string;
  options: Partial<AsciiOptions>;
}

export const VISUAL_PRESETS: VisualPreset[] = [
  { 
    id: 'cyber_matrix', 
    name: 'Neural Matrix', 
    options: { colorMode: 'matrix', density: 'complex', fontSize: 10, resolution: 0.18 } 
  },
  { 
    id: 'amber_glow', 
    name: 'Retro Terminal', 
    options: { colorMode: 'retro', density: 'simple', fontSize: 12, resolution: 0.15 } 
  },
  { 
    id: 'chroma_spectrum', 
    name: 'Chroma Spectrum', 
    options: { colorMode: 'color', density: 'complex', fontSize: 8, resolution: 0.25 } 
  },
  { 
    id: 'binary_void', 
    name: 'Binary Void', 
    options: { colorMode: 'bw', density: 'binary', fontSize: 14, resolution: 0.12 } 
  }
];