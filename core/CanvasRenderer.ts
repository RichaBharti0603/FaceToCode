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
    targetCtx.font = `${options.fontSize}px 'JetBrains Mono', monospace`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    targetCtx.fillStyle = '#ffffff'; // Use white for both monochromatic and color masks

    for (let x = 0; x < gridWidth; x++) {
      const xPos = (x + 0.5) * cellWidth;
      for (let y = 0; y < gridHeight; y++) {
        const yPos = (y + 0.5) * cellHeight;
        targetCtx.fillText(chars[y][x], xPos, yPos);
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
