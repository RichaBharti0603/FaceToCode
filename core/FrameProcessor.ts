import { ProcessedFrame } from './types';
import { AsciiOptions, DENSITY_MAPS } from '../types';

export class FrameProcessor {
  private hiddenCanvas: HTMLCanvasElement;
  private hiddenCtx: CanvasRenderingContext2D;
  private prevFrame: Float32Array | null = null;
  private inertia: number = 0.75;

  constructor() {
    this.hiddenCanvas = document.createElement('canvas');
    const ctx = this.hiddenCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Could not get 2d context for processing");
    this.hiddenCtx = ctx;
  }

  public process(video: HTMLVideoElement, canvasWidth: number, canvasHeight: number, options: AsciiOptions): ProcessedFrame {
    // 1. Calculate Grid Dimensions based on resolution
    // Standard char aspect ratio is ~0.6
    const baseCharHeight = 12; // Reference height
    const baseCharWidth = baseCharHeight * 0.6;
    
    // Grid density is determined by resolution slider
    const cols = Math.floor((canvasWidth * options.resolution) / baseCharWidth);
    const rows = Math.floor((canvasHeight * options.resolution) / baseCharHeight);
    
    if (cols <= 0 || rows <= 0) {
        return { chars: [], gridWidth: 0, gridHeight: 0, pixelData: new Uint8ClampedArray() };
    }

    // 2. Prepare hidden canvas
    if (this.hiddenCanvas.width !== cols || this.hiddenCanvas.height !== rows) {
      this.hiddenCanvas.width = cols;
      this.hiddenCanvas.height = rows;
      this.prevFrame = null;
    }

    // 3. Draw and Extract Pixels
    this.hiddenCtx.save();
    this.hiddenCtx.translate(cols, 0);
    this.hiddenCtx.scale(-1, 1);
    this.hiddenCtx.drawImage(video, 0, 0, cols, rows);
    this.hiddenCtx.restore();

    const imageData = this.hiddenCtx.getImageData(0, 0, cols, rows);
    const data = imageData.data;

    // 4. Temporal Smoothing
    if (!this.prevFrame || this.prevFrame.length !== data.length) {
      this.prevFrame = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) this.prevFrame[i] = data[i];
    } else {
      for (let i = 0; i < data.length; i++) {
        const target = data[i];
        const current = this.prevFrame[i];
        const newValue = current + (target - current) * (1 - this.inertia);
        this.prevFrame[i] = newValue;
        data[i] = newValue;
      }
    }

    // 5. Convert to ASCII
    const contrastFactor = (259 * (options.contrast * 255 + 255)) / (255 * (259 - options.contrast * 255));
    const map = DENSITY_MAPS[options.density];
    const mapLen = map.length - 1;
    const chars: string[] = [];

    for (let y = 0; y < rows; y++) {
      let rowStr = "";
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        brightness = contrastFactor * (brightness - 128) + 128;
        brightness *= options.brightness;
        brightness = Math.max(0, Math.min(255, brightness));

        const charIndex = Math.floor((brightness / 255) * mapLen);
        rowStr += map[charIndex];
      }
      chars.push(rowStr);
    }

    return {
      chars,
      gridWidth: cols,
      gridHeight: rows,
      pixelData: data
    };
  }
}
