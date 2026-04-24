import { AsciiFrame } from './types';
import { AsciiOptions } from '../types';

export class CanvasRenderer {
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    const ctx = this.offscreenCanvas.getContext('2d', { alpha: true, willReadFrequently: true });
    if (!ctx) throw new Error("Could not get offscreen context");
    this.offscreenCtx = ctx;
  }

  public render(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    frame: AsciiFrame,
    options: AsciiOptions,
    time: number = 0
  ): void {
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    if (!ctx || frame.width === 0) return;

    const { width, height } = canvas;
    const { width: gridWidth, height: gridHeight, chars } = frame;

    if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }

    // Royal Background (Deep Navy instead of black)
    ctx.fillStyle = '#0B1A2F';
    ctx.fillRect(0, 0, width, height);
    this.offscreenCtx.clearRect(0, 0, width, height);

    const isColorMode = options.colorMode === 'color';
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    const targetCtx = isColorMode ? this.offscreenCtx : ctx;
    
    targetCtx.save();
    targetCtx.font = `600 ${options.fontSize}px 'Playfair Display', serif`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    
    // Royal Glow effect
    targetCtx.shadowBlur = 6;
    targetCtx.shadowColor = 'rgba(199, 167, 93, 0.6)';

    // Render ASCII Grid
    for (let x = 0; x < gridWidth; x++) {
      const xPosBase = (x + 0.5) * cellWidth;
      for (let y = 0; y < gridHeight; y++) {
        const yPosBase = (y + 0.5) * cellHeight;
        const idx = y * gridWidth + x;
        const bVal = frame.brightness[idx];
        
        let char = chars[y][x];
        
        // Warm tone calculation
        const normalized = bVal / 255;
        const gammaCorrected = Math.pow(normalized, 1.1); // Gamma correction approx 1.1
        
        if (options.invert) {
            targetCtx.fillStyle = isColorMode ? '#ffffff' : `rgba(30, 58, 138, ${1 - gammaCorrected})`;
        } else {
            // Mix Royal Blue and Gold for brightness
            const blueWeight = 1 - gammaCorrected;
            const goldWeight = gammaCorrected;
            // Royal Blue: 30, 58, 138
            // Royal Gold: 199, 167, 93
            const r = Math.round(30 * blueWeight + 199 * goldWeight);
            const g = Math.round(58 * blueWeight + 167 * goldWeight);
            const b = Math.round(138 * blueWeight + 93 * goldWeight);
            
            targetCtx.fillStyle = isColorMode ? '#ffffff' : `rgb(${r}, ${g}, ${b})`;
        }

        targetCtx.fillText(char, xPosBase, yPosBase);
      }
    }
    targetCtx.restore();

    // Final Composition & Color Coding
    if (isColorMode) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      
      // Warm film filter (reduce contrast by 10-15%)
      ctx.filter = 'contrast(0.85) saturate(1.1) sepia(0.2)';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(this.offscreenCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Matrix filter fallback to Royal Rain
    if (options.filter === 'matrix') {
        ctx.fillStyle = 'rgba(30, 58, 138, 0.05)';
        for(let i=0; i<20; i++) {
            ctx.fillRect(Math.random() * width, Math.random() * height, cellWidth, cellHeight * (Math.random() * 5 + 1));
        }
    }
  }
}
