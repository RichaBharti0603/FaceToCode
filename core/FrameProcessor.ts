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
    // Mirror the video if needed
    processingCtx.save();
    
    // Aesthetic Boost: Apply slight blur to smooth out gradients before sampling
    processingCtx.filter = 'blur(1.5px)';
    
    processingCtx.scale(-1, 1);
    processingCtx.translate(-cols, 0);
    processingCtx.drawImage(video, 0, 0, cols, rows);
    processingCtx.restore();

    const imageData = processingCtx.getImageData(0, 0, cols, rows);
    const data = imageData.data;

    // 4. Calculate Frame Statistics for Adaptive Brightness
    let totalLuminance = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalLuminance += 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
    }
    const avgLuminance = totalLuminance / (cols * rows);
    // Target avg luminance is ~128 (middle gray). 
    // Correction factor is limited to avoid extreme blowing out.
    const adaptiveFactor = Math.min(1.5, Math.max(0.7, 128 / (avgLuminance || 1)));

    // 5. Calculate Brightness and apply Aesthetic weighting
    const inertia = 0.82; 
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

        // Rec. 709 luminance
        let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
        // --- Aesthetic Enhancements ---
        
        // A. Adaptive Auto-Exposure
        brightness *= adaptiveFactor;

        // B. Face-Centered Focus (Vignette)
        // distance from center (0.0 to 1.41)
        const dx = (x / cols) - 0.5;
        const dy = (y / rows) - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vignette = 1.0 - (dist * 0.3); // Brighten center, slightly dim edges
        brightness *= vignette;

        // C. Shadow Lifting
        brightness = Math.max(20, brightness); 

        // Application of options
        brightness = contrastFactor * (brightness - 128) + 128;
        brightness *= options.brightness;
        brightness = Math.max(0, Math.min(255, brightness));

        // Temporal Smoothing
        const idx = y * cols + x;
        const prev = prevBrightnessBuffer[idx];
        const smoothed = prev + (brightness - prev) * (1 - inertia);
        
        brightnessBuffer[idx] = smoothed;
        prevBrightnessBuffer[idx] = smoothed;

        // Map to character
        const charIndex = Math.floor((smoothed / 255) * mapLen);
        row.push(densityMap[charIndex]);
        
        // Save colors (with adaptive correction)
        colorBuffer[i] = Math.min(255, r * adaptiveFactor);
        colorBuffer[i + 1] = Math.min(255, g * adaptiveFactor);
        colorBuffer[i + 2] = Math.min(255, b * adaptiveFactor);
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
