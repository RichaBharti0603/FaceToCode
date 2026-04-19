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
      // Pastel Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, options.backgroundColor || '#ffe4ec'); // Blush
      bgGrad.addColorStop(0.5, '#ffffff');
      bgGrad.addColorStop(1, '#f3e8ff'); // Lavender
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background Radial Glow (Subject Focus)
      const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.4);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#111111';
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
    
    if (options.lightMode) {
        targetCtx.fillStyle = '#6c757d'; // Soft Grey
        targetCtx.globalAlpha = 0.85; // Breathable
    } else {
        targetCtx.fillStyle = '#ffffff'; 
    }
    // A. Advanced Glow & Bloom Pass
    const isDreamy = options.theme === 'dreamy' || options.theme === 'pink' || options.filter === 'paris_glow' || options.filter === 'seoul_dream';
    
    if (isDreamy) {
        // Bloom Pass: Large soft glow
        const bloom = Math.sin(time * 0.003) * 3 + 12;
        targetCtx.shadowBlur = options.fontSize * (0.5 + (bloom / 15));
        targetCtx.shadowColor = options.filter === 'paris_glow' ? 'rgba(255, 180, 200, 0.6)' : 'rgba(200, 220, 255, 0.5)';
        
        // Bloom layering
        targetCtx.globalAlpha = 0.4;
        for (let x = 0; x < gridWidth; x += 2) { 
           for (let y = 0; y < gridHeight; y += 2) {
              targetCtx.fillText(chars[y][x], (x + 0.5) * cellWidth, (y + 0.5) * cellHeight);
           }
        }
        targetCtx.globalAlpha = 1.0;
        targetCtx.shadowBlur = 0; // Reset for primary text
    }

    // B. Primary Character Grid Rendering
    for (let x = 0; x < gridWidth; x++) {
      const xPosBase = (x + 0.5) * cellWidth;
      for (let y = 0; y < gridHeight; y++) {
        const yPosBase = (y + 0.5) * cellHeight;
        
        // Interactive Shimmer
        let xPos = xPosBase;
        let yPos = yPosBase;
        if (time > 0) {
            const shimmerX = Math.sin(time * 0.002 + x * 0.1 + y * 0.05) * (cellWidth * 0.05);
            const shimmerY = Math.cos(time * 0.002 + x * 0.05 + y * 0.1) * (cellHeight * 0.05);
            xPos += shimmerX;
            yPos += shimmerY;
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
      
      // Apply color grading to the video feed itself
      if (options.filter === 'paris_glow') ctx.filter = 'saturate(0.8) brightness(1.2) hue-rotate(-10deg)';
      if (options.filter === 'seoul_dream') ctx.filter = 'saturate(0.9) brightness(1.15) contrast(0.9) hue-rotate(10deg)';
      
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(this.offscreenCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      
      // Final Aesthetic Softening Layer
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      if (options.filter === 'paris_glow') {
          ctx.fillStyle = 'hsla(340, 100%, 85%, 0.15)';
          ctx.fillRect(0, 0, width, height);
      } else if (options.filter === 'seoul_dream') {
          ctx.fillStyle = 'hsla(260, 100%, 85%, 0.15)';
          ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    }

    // 5. Final Soft Blur (Stylized Portrait Finish)
    if (isDreamy) {
        ctx.filter = 'blur(0.4px)';
        const temp = ctx.getImageData(0, 0, width, height);
        ctx.putImageData(temp, 0, 0);
        ctx.filter = 'none';
    }

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
