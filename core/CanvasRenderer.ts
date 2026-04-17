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
    options: AsciiOptions
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

    // 2. Update Matrix Animation State
    if (options.colorMode === 'matrix') {
      if (this.matrixOffsets.length !== gridWidth) {
        this.matrixOffsets = Array.from({ length: gridWidth }, () => Math.random() * gridHeight);
        this.matrixSpeeds = Array.from({ length: gridWidth }, () => 0.05 + Math.random() * 0.15);
      }
      for (let i = 0; i < gridWidth; i++) {
        this.matrixOffsets[i] = (this.matrixOffsets[i] + this.matrixSpeeds[i]) % gridHeight;
      }
    }

    const isColorMode = options.colorMode === 'color';
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    // 3. Clear canvases
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    this.offscreenCtx.clearRect(0, 0, width, height);

    // 4. Render ASCII to Offscreen (if Color) or Main (if Mono)
    const targetCtx = isColorMode ? this.offscreenCtx : ctx;
    
    targetCtx.save();
    targetCtx.font = `${options.fontSize}px 'JetBrains Mono', monospace`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';

    if (!isColorMode) {
      if (options.colorMode === 'matrix') targetCtx.fillStyle = '#00ff41';
      else if (options.colorMode === 'retro') targetCtx.fillStyle = '#ffb000';
      else targetCtx.fillStyle = '#ffffff'; // 'bw'
    } else {
      targetCtx.fillStyle = '#ffffff'; // White mask for color mode
    }

    const isMatrix = options.colorMode === 'matrix';

    for (let x = 0; x < gridWidth; x++) {
      const xPos = (x + 0.5) * cellWidth;
      const offset = isMatrix ? Math.floor(this.matrixOffsets[x]) : 0;
      
      for (let y = 0; y < gridHeight; y++) {
        const yPos = (y + 0.5) * cellHeight;
        const charY = isMatrix ? (y - offset + gridHeight) % gridHeight : y;
        targetCtx.fillText(chars[charY][x], xPos, yPos);
      }
    }
    targetCtx.restore();

    // 5. Final Composition for Color Mode
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
  }
}
