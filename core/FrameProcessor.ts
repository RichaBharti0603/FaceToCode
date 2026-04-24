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
        
        // 1. WARM COLOR GRADING (PRE-LUMINOSITY)
        const rRaw = data[i];
        const gRaw = data[i + 1];
        const bRaw = data[i + 2];
        const r = Math.min(255, rRaw * 1.15);
        const g = Math.min(255, gRaw * 1.05);
        const b = Math.min(255, bRaw * 0.85);

        // 2. MODIFIED LUMINOSITY FORMULA (DUSKY BIAS)
        let brightness = 0.35 * r + 0.55 * g + 0.1 * b;
        
        // A. Adaptive Exposure & Focus
        brightness *= adaptiveFactor;
        const dx = (x / cols) - 0.5;
        const dy = (y / rows) - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const centerFocus = Math.exp(-dist * 1.5) * 0.3 + 1.0; 
        brightness *= centerFocus;

        // 3. CORE FIX: VINTAGE BRIGHTNESS MAPPING (ETHEREAL)
        // Lifts dark areas and ensures face visibility with a warm, soft look
        // Formula: brightness = brightness * 0.75 + 80
        brightness = brightness * 0.75 + 80;
        
        // Clamp to avoid pure black technical extremes while keeping it soft
        brightness = Math.max(80, Math.min(245, brightness));

        // 4. KEEP FACIAL FEATURES VISIBLE (EDGE BOOST)
        // Simple horizontal edge detection for detail preservation
        if (x > 0) {
            const pi = (y * cols + (x - 1)) * 4;
            const pBright = (0.35 * data[pi] + 0.55 * data[pi+1] + 0.1 * data[pi+2]) * 0.6 + 90;
            if (Math.abs(brightness - pBright) > 12) {
                brightness = Math.min(255, brightness * 1.1); // Boost contrast only for features
            }
        }

        // Temporal Smoothing
        const idx = y * cols + x;
        const prev = prevBrightnessBuffer[idx];
        const smoothed = prev + (brightness - prev) * (1 - inertia);
        
        brightnessBuffer[idx] = smoothed;
        prevBrightnessBuffer[idx] = smoothed;

        // 5. ENSURE FULL PIXEL COVERAGE
        // Map to character (DUSKY variant " .:-=+*")
        // We use Math.floor which is safe.
        const charPool = DENSITY_MAPS.dusky || DENSITY_MAPS.soft;
        const charPoolLen = charPool.length - 1;
        const charIndex = Math.floor((smoothed / 255) * charPoolLen);
        row.push(charPool[charIndex]);
        
        // Save colors for rendering (BROWN/DUSKY palette is applied in Renderer)
        colorBuffer[i] = r;
        colorBuffer[i + 1] = g;
        colorBuffer[i + 2] = b;
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
