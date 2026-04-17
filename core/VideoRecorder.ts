export interface RecordOptions {
  fps?: number;
  width?: number;
  height?: number;
  isUnlocked?: boolean;
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private recordingCanvas: HTMLCanvasElement | null = null;
  private recordingCtx: CanvasRenderingContext2D | null = null;
  private isUnlocked: boolean = false;

  public start(sourceCanvas: HTMLCanvasElement, options: RecordOptions = {}): void {
    if (this.mediaRecorder?.state === 'recording') return;
    
    this.chunks = [];
    this.isUnlocked = options.isUnlocked || false;
    
    const fps = options.fps || 30;
    const targetWidth = options.width || sourceCanvas.width;
    const targetHeight = options.height || sourceCanvas.height;

    // Create a proxy canvas for the desired resolution
    this.recordingCanvas = document.createElement('canvas');
    this.recordingCanvas.width = targetWidth;
    this.recordingCanvas.height = targetHeight;
    this.recordingCtx = this.recordingCanvas.getContext('2d', { alpha: false });
    
    if (!this.recordingCtx) throw new Error("Could not get recording context");

    const stream = this.recordingCanvas.captureStream(fps);
    
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    
    const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';

    try {
      this.mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 5000000 // High bitrate for HD
      });
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      
      this.mediaRecorder.onstop = () => {
        this.download();
      };

      this.mediaRecorder.start();
    } catch (e) {
      console.error("VideoRecorder start failed:", e);
    }
  }

  public drawFrame(sourceCanvas: HTMLCanvasElement): void {
    if (!this.recordingCanvas || !this.recordingCtx || this.mediaRecorder?.state !== 'recording') return;

    const { width: tw, height: th } = this.recordingCanvas;
    const { width: sw, height: sh } = sourceCanvas;

    // Clear background
    this.recordingCtx.fillStyle = '#000000';
    this.recordingCtx.fillRect(0, 0, tw, th);

    // Maintain Aspect Ratio (Fit with letterboxing)
    const scale = Math.min(tw / sw, th / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (tw - dw) / 2;
    const dy = (th - dh) / 2;

    this.recordingCtx.drawImage(sourceCanvas, dx, dy, dw, dh);

    // Add Watermark if not unlocked
    if (!this.isUnlocked) {
      this.recordingCtx.save();
      this.recordingCtx.font = `${Math.floor(th * 0.03)}px 'JetBrains Mono', monospace`;
      this.recordingCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.recordingCtx.textAlign = 'right';
      this.recordingCtx.textBaseline = 'bottom';
      this.recordingCtx.fillText('FaceToCode', tw - 20, th - 20);
      this.recordingCtx.restore();
    }
  }

  public stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.recordingCanvas = null;
    this.recordingCtx = null;
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private download(): void {
    if (this.chunks.length === 0) return;

    const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii_render_${Date.now()}.${blob.type.split('/')[1].split(';')[0] || 'webm'}`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
