import { AsciiFrame } from './types';
import { AsciiOptions, DENSITY_MAPS } from '../types';

export class FrameProcessor {
  private processingCanvas: HTMLCanvasElement;
  private processingCtx: CanvasRenderingContext2D;
  
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
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    const cols = Math.max(1, Math.floor(videoWidth * options.resolution));
    const rows = Math.max(1, Math.floor(videoHeight * options.resolution));

    if (this.processingCanvas.width !== cols || this.processingCanvas.height !== rows) {
      this.processingCanvas.width = cols;
      this.processingCanvas.height = rows;
      
      this.brightnessBuffer = new Float32Array(cols * rows);
      this.prevBrightnessBuffer = new Float32Array(cols * rows);
      this.colorBuffer = new Uint8ClampedArray(cols * rows * 4);
    }

    const { brightnessBuffer, prevBrightnessBuffer, colorBuffer, processingCtx } = this;
    if (!brightnessBuffer || !prevBrightnessBuffer || !colorBuffer) {
        throw new Error("Buffers not initialized");
    }

    processingCtx.save();
    processingCtx.scale(-1, 1);
    processingCtx.translate(-cols, 0);
    
    // Terminal style filtering + Contrast Boost (+10%)
    let filterString = `contrast(${options.contrast * 1.1}) brightness(${options.brightness})`;
    
    // Apply new effects
    if (options.edgeDetection) filterString += ' invert(1) contrast(200%) grayscale(100%)';
    if (options.hueShift) filterString += ` hue-rotate(${options.hueShift}deg)`;
    if (options.warmth) filterString += ` sepia(${options.warmth}%)`;
    
    processingCtx.filter = filterString;
    processingCtx.drawImage(video, 0, 0, cols, rows);
    processingCtx.filter = 'none';
    processingCtx.restore();

    const imageData = processingCtx.getImageData(0, 0, cols, rows);
    const data = imageData.data;

    const inertia = 0.85; 
    
    const chars: string[][] = [];
    const charPool = options.characterSet === 'custom' && options.customChars
        ? options.customChars
        : DENSITY_MAPS[options.characterSet] || DENSITY_MAPS.standard;
    const charPoolLen = charPool.length - 1;

    for (let y = 0; y < rows; y++) {
      const row: string[] = [];
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Standard Luminosity Formula
        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        
        const idx = y * cols + x;
        const prev = prevBrightnessBuffer[idx];
        const smoothed = prev + (brightness - prev) * (1 - inertia);
        
        brightnessBuffer[idx] = smoothed;
        prevBrightnessBuffer[idx] = smoothed;

        // Map to character
        let normalized = smoothed / 255;
        if (options.invert) {
            normalized = 1 - normalized;
        }
        
        const charIndex = Math.floor(normalized * charPoolLen);
        
        // Slight randomness for organic feel (avoid uniform blocks)
        const randomOffset = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        
        // Ensure index is within bounds
        const safeIndex = Math.max(0, Math.min(charPoolLen, charIndex + randomOffset));
        row.push(charPool[safeIndex]);
        
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
