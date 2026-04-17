import { AsciiFrame } from './types';
import { AsciiOptions } from '../types';

export class CanvasRenderer {
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  private matrixOffsets: number[] = [];
  private matrixSpeeds: number[] = [];

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    const ctx = this.offscreenCanvas.getContext('2d', { alpha: true });
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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx || frame.width === 0) return;

    const { width, height } = canvas;
    const { width: gridWidth, height: gridHeight, chars } = frame;

    // 1. Prepare Offscreen Canvas for ASCII Mask
    if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }

    // 2. Clear canvases
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    this.offscreenCtx.clearRect(0, 0, width, height);

    const isColorMode = options.colorMode === 'color';
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    // 3. Render ASCII to Offscreen (if Color) or Main (if Mono)
    const targetCtx = isColorMode ? this.offscreenCtx : ctx;
    
    targetCtx.save();
    targetCtx.font = `900 ${options.fontSize}px 'JetBrains Mono', monospace`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    targetCtx.fillStyle = '#ffffff'; 

    // A. Glow Implementation
    const isDreamy = options.theme === 'dreamy' || options.theme === 'pink';
    if (isDreamy) {
        targetCtx.shadowBlur = options.fontSize * 0.4;
        targetCtx.shadowColor = options.theme === 'pink' ? 'rgba(255, 113, 162, 0.8)' : 'rgba(255, 255, 255, 0.5)';
    }

    // B. Character Grid Rendering with Shimmer
    for (let x = 0; x < gridWidth; x++) {
      const xPosBase = (x + 0.5) * cellWidth;
      for (let y = 0; y < gridHeight; y++) {
        const yPosBase = (y + 0.5) * cellHeight;
        
        // Interactive Shimmer
        let xPos = xPosBase;
        let yPos = yPosBase;
        if (time > 0) {
            const shimmerX = Math.sin(time * 0.002 + x * 0.1 + y * 0.05) * (cellWidth * 0.1);
            const shimmerY = Math.cos(time * 0.002 + x * 0.05 + y * 0.1) * (cellHeight * 0.1);
            xPos += shimmerX;
            yPos += shimmerY;
        }

        targetCtx.fillText(chars[y][x], xPos, yPos);
      }
    }
    targetCtx.restore();

    // 4. Final Composition for Color Mode
    if (isColorMode) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(this.offscreenCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }

    // 5. Meme Overlay (Viral Boost)
    if (options.memeTextTop || options.memeTextBottom) {
        ctx.save();
        ctx.font = `900 ${Math.floor(width * 0.06)}px 'JetBrains Mono', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = width * 0.008;
        ctx.lineJoin = 'round';

        if (options.memeTextTop) {
            const text = options.memeTextTop.toUpperCase();
            ctx.strokeText(text, width / 2, height * 0.15);
            ctx.fillText(text, width / 2, height * 0.15);
        }
        if (options.memeTextBottom) {
            const text = options.memeTextBottom.toUpperCase();
            ctx.strokeText(text, width / 2, height * 0.9);
            ctx.fillText(text, width / 2, height * 0.9);
        }
        ctx.restore();
    }
  }
}
