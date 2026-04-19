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

    // 2. Clear canvases and Draw Background
    if (options.lightMode) {
      // 8. BACKGROUND COLOR (WARM CREAM)
      ctx.fillStyle = '#f5e6da';
      ctx.fillRect(0, 0, width, height);

      // 10. ADD SOFT CENTER LIGHTING
      const lighting = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
      lighting.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Center Bright
      lighting.addColorStop(1, 'rgba(0, 0, 0, 0.05)');     // Edges slightly darker
      ctx.fillStyle = lighting;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#2b1d16'; // Deep Dusk Brown
      ctx.fillRect(0, 0, width, height);
    }
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
    
    // 9. REDUCE CHARACTER HARSHNESS
    targetCtx.globalAlpha = 0.75;
    targetCtx.shadowBlur = 0; // Disable previous harsh glow

    // 6. BROWN / DUSKY ASCII COLOR PALETTE
    // 12. REMOVE PURE BLACK OUTPUT (darkest = #6f4e37)
    const brownPalette = ['#6f4e37', '#8b5e3c', '#c08a5d', '#e6b98c'];

    // A. Advanced Glow & Bloom Pass
    const isDreamy = options.theme === 'dreamy' || options.theme === 'pink' || options.filter === 'paris_glow' || options.filter === 'seoul_dream';
    
    if (isDreamy) {
        // Softened Bloom for dusky look
        targetCtx.shadowBlur = options.fontSize * 0.4;
        targetCtx.shadowColor = 'rgba(111, 78, 55, 0.3)'; // Coffee Glow
        
        targetCtx.globalAlpha = 0.3;
        for (let x = 0; x < gridWidth; x += 3) { 
           for (let y = 0; y < gridHeight; y += 3) {
              const bVal = frame.brightness[y * gridWidth + x];
              const cIdx = Math.min(3, Math.floor((bVal / 255) * brownPalette.length));
              targetCtx.fillStyle = brownPalette[cIdx];
              targetCtx.fillText(chars[y][x], (x + 0.5) * cellWidth, (y + 0.5) * cellHeight);
           }
        }
        targetCtx.globalAlpha = 0.75;
    }

    // B. Primary Character Grid Rendering
    for (let x = 0; x < gridWidth; x++) {
      const xPosBase = (x + 0.5) * cellWidth;
      for (let y = 0; y < gridHeight; y++) {
        const yPosBase = (y + 0.5) * cellHeight;
        const idx = y * gridWidth + x;
        const bVal = frame.brightness[idx];
        
        // Color mapping to dusky brown palette
        if (!isColorMode) {
            const cIdx = Math.min(3, Math.floor((bVal / 255) * brownPalette.length));
            targetCtx.fillStyle = brownPalette[cIdx];
        } else {
            targetCtx.fillStyle = '#ffffff'; 
        }

        // Interactive Shimmer (Subtle)
        let xPos = xPosBase;
        let yPos = yPosBase;
        if (time > 0) {
            const sh = Math.sin(time * 0.001 + x * 0.1) * (cellWidth * 0.02);
            xPos += sh;
        }

        targetCtx.fillText(chars[y][x], xPos, yPos);
      }
    }
    targetCtx.restore();

    // 4. Final Composition & Aesthetic Grading
    if (isColorMode) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      
      // Filter for brown-toned video feed
      ctx.filter = 'sepia(0.8) contrast(0.9) brightness(1.1) hue-rotate(-10deg)';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(this.offscreenCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      
      // Final Aesthetic Wash
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(111, 78, 55, 0.1)'; // Coffee Wash
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 5. Final Soft Blur (9. REDUCE CHARACTER HARSHNESS - Subtle blur)
    ctx.filter = 'blur(0.4px)';
    const temp = ctx.getImageData(0, 0, width, height);
    ctx.putImageData(temp, 0, 0);
    ctx.filter = 'none';

    // 6. Meme Overlay (Viral Boost)
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
