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
    
    if ('letterSpacing' in targetCtx) {
      (targetCtx as any).letterSpacing = '1px';
    }
    
    // Soft glow layer - Reduced blur for clarity
    targetCtx.shadowBlur = 2;
    targetCtx.shadowColor = 'rgba(199, 167, 93, 0.4)';

    // Subtle motion: Micro flicker (simulate CRT shimmer)
    const baseFlicker = options.flickerIntensity || 0.05;
    targetCtx.globalAlpha = Math.random() > (1 - baseFlicker) ? (1 - baseFlicker * 2) : 1.0;

    // Color Gradient Rendering (Vertical)
    // top -> #1E3A8A, mid -> #3B82F6, highlight -> #C7A75D
    const gradient = targetCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1E3A8A');
    gradient.addColorStop(0.5, '#3B82F6');
    gradient.addColorStop(1, '#C7A75D');

    if (!isColorMode) {
      targetCtx.fillStyle = gradient;
    } else {
      targetCtx.fillStyle = '#ffffff';
    }

    // Render ASCII Grid
    for (let x = 0; x < gridWidth; x++) {
      let xPosBase = (x + 0.5) * cellWidth;
      
      for (let y = 0; y < gridHeight; y++) {
        // Output Refinement: increase line-height slightly by scaling y-spacing
        let yPosBase = (y + 0.5) * cellHeight * 1.02;
        
        // Wave Distortion
        if (options.waveDistortion) {
          xPosBase += Math.sin(time / 500 + y * 0.1) * (options.waveDistortion * 5);
        }
        
        const idx = y * gridWidth + x;
        const bVal = frame.brightness[idx];
        
        let char = chars[y][x];
        
        const normalized = bVal / 255;
        
        // Depth Effect: background fade, foreground boost
        if (options.depthEffect) {
          if (normalized < 0.3) {
             targetCtx.globalAlpha = 0.3; // fade background
          } else {
             targetCtx.globalAlpha = 1.0; // boost foreground
          }
        }
        
        // Edge emphasis: drop characters that are too dark to increase contrast around edges
        if (normalized < 0.12 && !options.invert) {
            continue;
        }

        if (options.invert) {
            targetCtx.fillStyle = isColorMode ? '#ffffff' : `rgba(30, 58, 138, ${1 - Math.pow(normalized, 1.1)})`;
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
