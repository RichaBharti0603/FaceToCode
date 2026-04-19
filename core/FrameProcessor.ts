import { AsciiFrame } from './types';
import { AsciiOptions, DENSITY_MAPS } from '../types';

export class FrameProcessor {
  private processingCanvas: HTMLCanvasElement;
  private processingCtx: CanvasRenderingContext2D;
  
  // Buffers for reuse to minimize GC
  private brightnessBuffer: Float32Array | null = null;
  private prevBrightnessBuffer: Float32Array | null = null;
  private colorBuffer: Uint8ClampedArray | null = null;

  constructor() {
    this.processingCanvas = document.createElement('canvas');
    const ctx = this.processingCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false 
    });
    if (!ctx) throw new Error("Could not get 2d context for processing");
    this.processingCtx = ctx;
  }

  public process(
    video: HTMLVideoElement, 
    options: AsciiOptions
  ): AsciiFrame {
    // 1. Determine Grid Dimensions
    // Standard char aspect ratio in monospace fonts is roughly 0.6
    // We use resolution to determine the number of cells
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    // Grid density is controlled by options.resolution
    // For 1280x720, resolution 0.1 means 128x72 cells
    const cols = Math.max(1, Math.floor(videoWidth * options.resolution));
    const rows = Math.max(1, Math.floor(videoHeight * options.resolution));

    // 2. Prepare Processing Canvas
    if (this.processingCanvas.width !== cols || this.processingCanvas.height !== rows) {
      this.processingCanvas.width = cols;
      this.processingCanvas.height = rows;
      
      // Reset buffers if size changes
      this.brightnessBuffer = new Float32Array(cols * rows);
      this.prevBrightnessBuffer = new Float32Array(cols * rows);
      this.colorBuffer = new Uint8ClampedArray(cols * rows * 4);
    }

    const { brightnessBuffer, prevBrightnessBuffer, colorBuffer, processingCtx } = this;
    if (!brightnessBuffer || !prevBrightnessBuffer || !colorBuffer) {
        throw new Error("Buffers not initialized");
    }

    // 3. Draw and Extract Pixels
    processingCtx.save();
    processingCtx.scale(-1, 1);
    processingCtx.translate(-cols, 0);
    
    // Aesthetic Boost: Higher smoothing for skin tones
    processingCtx.filter = 'blur(1.8px) contrast(1.05) brightness(1.1)';
    processingCtx.drawImage(video, 0, 0, cols, rows);
    processingCtx.filter = 'none';
    processingCtx.restore();

    const imageData = processingCtx.getImageData(0, 0, cols, rows);
    const data = imageData.data;

    // 4. Calculate Frame Statistics for Adaptive Brightness
    let totalLuminance = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Skin-Biased Luminance Weighting (R/G primary)
      totalLuminance += 0.5 * data[i] + 0.4 * data[i+1] + 0.1 * data[i+2];
    }
    const avgLuminance = totalLuminance / (cols * rows);
    const adaptiveFactor = Math.min(1.4, Math.max(0.8, 140 / (avgLuminance || 1)));

    // 5. Calculate Brightness and apply Aesthetic weighting
    const inertia = 0.85; 
    const contrastFactor = (259 * (options.contrast * 255 + 255)) / (255 * (259 - options.contrast * 255));
    
    const chars: string[][] = [];
    const densityMap = DENSITY_MAPS[options.density];
    const mapLen = densityMap.length - 1;

    for (let y = 0; y < rows; y++) {
      const row: string[] = [];
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Face-Biased Luminance Weighting
        let brightness = 0.5 * r + 0.4 * g + 0.1 * b;
        
        // A. Adaptive Auto-Exposure
        brightness *= adaptiveFactor;

        // B. Face-Centered Magic Glow (Stronger falloff)
        const dx = (x / cols) - 0.5;
        const dy = (y / rows) - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const centerFocus = Math.exp(-dist * 1.5) * 0.4 + 1.0; 
        brightness *= centerFocus;

        // C. Shadow Lifting & Range Clamping (Light Mode Optimized)
        if (options.lightMode) {
          // Compress contrast for airy, eye-comfortable look
          brightness = brightness * 0.6 + 80;
          brightness = Math.max(90, Math.min(240, brightness));
        } else {
          brightness = Math.max(30, Math.min(235, brightness)); 
        }

        // Application of options
        brightness = contrastFactor * (brightness - 128) + 128;
        brightness *= options.brightness;
        brightness = Math.max(0, Math.min(255, brightness));

        // Temporal Smoothing (higher inertia for silkier video)
        const idx = y * cols + x;
        const prev = prevBrightnessBuffer[idx];
        const smoothed = prev + (brightness - prev) * (1 - inertia);
        
        brightnessBuffer[idx] = smoothed;
        prevBrightnessBuffer[idx] = smoothed;

        // Map to character
        const charIndex = Math.floor((smoothed / 255) * mapLen);
        row.push(densityMap[charIndex]);
        
        // Save colors with subtle skin-tone warming
        colorBuffer[i] = Math.min(255, r * adaptiveFactor * 1.05); // Warmth
        colorBuffer[i + 1] = Math.min(255, g * adaptiveFactor);
        colorBuffer[i + 2] = Math.min(255, b * adaptiveFactor * 0.95); // Reduce blue
        colorBuffer[i + 3] = 255;
      }
      chars.push(row);
    }

    return {
      chars,
      width: cols,
      height: rows,
      brightness: brightnessBuffer,
      colors: colorBuffer
    };
  }
}
