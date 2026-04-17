import { CameraManager } from './CameraManager';
import { FrameProcessor } from './FrameProcessor';
import { CanvasRenderer } from './CanvasRenderer';
import { VideoRecorder } from './VideoRecorder';
import { AsciiOptions } from '../types';
import { EngineEvents } from './types';

export class AsciiEngine {
  private camera: CameraManager;
  private processor: FrameProcessor;
  private renderer: CanvasRenderer;
  private recorder: VideoRecorder;
  
  private canvas: HTMLCanvasElement | null = null;
  private options: AsciiOptions;
  private frameId: number | null = null;
  private events: Partial<EngineEvents> = {};

  constructor(options: AsciiOptions, events: Partial<EngineEvents> = {}) {
    this.camera = CameraManager.getInstance();
    this.processor = new FrameProcessor();
    this.renderer = new CanvasRenderer();
    this.recorder = new VideoRecorder();
    this.options = options;
    this.events = events;
  }

  public async start(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    try {
      this.events.onStateChange?.('idle');
      await this.camera.start();
      this.events.onStateChange?.('running');
      this.loop();
    } catch (e) {
      console.error("AsciiEngine failed to start:", e);
      this.events.onStateChange?.('error');
    }
  }

  public stop(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.camera.stop();
    this.recorder.stop();
    this.events.onStateChange?.('idle');
  }

  public updateOptions(options: AsciiOptions): void {
    this.options = options;
  }

  public startRecording(): void {
    if (this.canvas) {
      this.recorder.start(this.canvas);
    }
  }

  public stopRecording(): void {
    this.recorder.stop();
  }

  public isRecording(): boolean {
    return this.recorder.isRecording();
  }

  private loop = (): void => {
    const video = this.camera.getVideo();
    if (!this.canvas || !video || video.readyState < 2) {
      this.frameId = requestAnimationFrame(this.loop);
      return;
    }

    // Process
    const processedFrame = this.processor.process(
      video, 
      this.canvas.width, 
      this.canvas.height, 
      this.options
    );

    // Notify listeners
    this.events.onFrame?.(processedFrame);

    // Render
    this.renderer.render(this.canvas, video, processedFrame, this.options);

    this.frameId = requestAnimationFrame(this.loop);
  };
}
