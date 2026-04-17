export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  public start(canvas: HTMLCanvasElement, fps: number = 30): void {
    this.chunks = [];
    const stream = canvas.captureStream(fps);
    
    // Check for supported mime types
    const options = { mimeType: 'video/webm; codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      
      this.mediaRecorder.onstop = () => {
        this.download();
      };

      this.mediaRecorder.start();
    } catch (e) {
      console.error("MediaRecorder failed:", e);
    }
  }

  public stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private download(): void {
    const blob = new Blob(this.chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii_capture_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
