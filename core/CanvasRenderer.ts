import { ProcessedFrame } from './types';
import { AsciiOptions } from '../types';

export class CanvasRenderer {
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    const ctx = this.offscreenCanvas.getContext('2d');
    if (!ctx) throw new Error("Could not get offscreen context");
    this.offscreenCtx = ctx;
  }

  public render(
    canvas: HTMLCanvasElement, 
    video: HTMLVideoElement, 
    frame: ProcessedFrame, 
    options: AsciiOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || frame.gridWidth === 0) return;

    const { width, height } = canvas;
    const { gridWidth, gridHeight, chars } = frame;
    const slotWidth = width / gridWidth;
    const slotHeight = height / gridHeight;

    // 1. Prepare Offscreen Canvas for ASCII Mask
    if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }

    // 2. Determine Style
    let textColor = '#ffffff';
    let isColorMode = options.colorMode === 'color';

    if (options.colorMode === 'matrix') textColor = '#00ff41';
    else if (options.colorMode === 'retro') textColor = '#ffb000';
    else if (options.colorMode === 'bw') textColor = '#ffffff';

    // 3. Draw ASCII to Offscreen (Mask)
    this.offscreenCtx.clearRect(0, 0, width, height);
    this.offscreenCtx.font = `${options.fontSize}px 'JetBrains Mono', monospace`;
    this.offscreenCtx.fillStyle = isColorMode ? '#ffffff' : textColor;
    this.offscreenCtx.textBaseline = 'middle';
    this.offscreenCtx.textAlign = 'center';

    for (let y = 0; y < gridHeight; y++) {
      const row = chars[y];
      const yPos = (y + 0.5) * slotHeight;
      
      // We can draw the whole row if characters are monospace and we trust the width
      // but for better alignment with slotWidth, we draw char by char in the mask.
      // Even drawChar is fast on the offscreen canvas because we don't change state.
      for (let x = 0; x < gridWidth; x++) {
        const xPos = (x + 0.5) * slotWidth;
        this.offscreenCtx.fillText(row[x], xPos, yPos);
      }
    }

    // 4. Final Composition on Main Canvas
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (isColorMode) {
      // Draw scaled video as source
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      // Mask with ASCII
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(this.offscreenCanvas, 0, 0);
    } else {
      // Just draw the mask (which contains the colored/styled text)
      ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
    ctx.restore();
  }
}
