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
    // Mirror the video if needed (usually webcam feels better mirrored)
    processingCtx.save();
    processingCtx.scale(-1, 1);
    processingCtx.translate(-cols, 0);
    processingCtx.drawImage(video, 0, 0, cols, rows);
    processingCtx.restore();

    const imageData = processingCtx.getImageData(0, 0, cols, rows);
    const data = imageData.data;

    // 4. Calculate Brightness and Apply Temporal Smoothing
    // smoothing 0.0 = no smoothing, 1.0 = static
    const inertia = 0.75; 
    const contrastFactor = (259 * (options.contrast * 255 + 255)) / (255 * (259 - options.contrast * 255));
    
    const chars: string[][] = [];
    const density = options.colorMode === 'matrix' ? 'matrix' : options.density;
    const densityMap = DENSITY_MAPS[density];
    const mapLen = densityMap.length - 1;

    for (let y = 0; y < rows; y++) {
      const row: string[] = [];
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Rec. 709 luminance
        let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
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
        
        // Save colors for renderer
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
