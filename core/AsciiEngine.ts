import { CameraManager } from './CameraManager';
import { FrameProcessor } from './FrameProcessor';
import { CanvasRenderer } from './CanvasRenderer';
import { VideoRecorder } from './VideoRecorder';
import { AsciiOptions, AnalysisResult } from '../types';
import { EngineEvents } from './types';
import { analyzeImage } from '../services/geminiService';

export class AsciiEngine {
  private camera: CameraManager;
  private processor: FrameProcessor;
  private renderer: CanvasRenderer;
  private recorder: VideoRecorder;
  
  private canvas: HTMLCanvasElement | null = null;
  private options: AsciiOptions;
  private frameId: number | null = null;
  private events: Partial<EngineEvents> = {};
  private isRunning: boolean = false;

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
    if (this.isRunning) return;

    try {
      this.events.onStateChange?.('idle');
      
      // Initialize camera
      await this.camera.start();
      
      // Discover cameras for the UI
      const devices = await this.camera.getDevices();
      this.events.onCamerasDiscovered?.(devices);
      
      this.isRunning = true;
      this.events.onStateChange?.('running');
      this.loop();
    } catch (e) {
      console.error("AsciiEngine failed to start:", e);
      this.events.onStateChange?.('error');
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.camera.stop();
    this.recorder.stop();
    this.events.onStateChange?.('idle');
  }

  public setCamera(deviceId: string): void {
    this.camera.start(deviceId).catch(console.error);
  }

  public updateOptions(options: AsciiOptions): void {
    this.options = options;
  }

  public startRecording(options?: any): void {
    if (this.canvas) {
      this.recorder.start(this.canvas, options);
    }
  }

  public stopRecording(): void {
    this.recorder.stop();
  }

  public isRecording(): boolean {
    return this.recorder.isRecording();
  }

  public async getCaption(): Promise<AnalysisResult> {
    if (!this.canvas) throw new Error("Canvas not available");
    const base64 = this.canvas.toDataURL('image/png');
    return await analyzeImage(base64);
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const video = this.camera.getVideo();
    if (!this.canvas || !video || video.readyState < 2) {
      this.frameId = requestAnimationFrame(this.loop);
      return;
    }

    // 1. Process Frame (Downsample + Temporal Smoothing)
    const asciiFrame = this.processor.process(video, this.options);

    // 2. Notify Listeners (for Analysis or Preview)
    this.events.onFrame?.(asciiFrame);

    // 3. Render to Canvas
    this.renderer.render(this.canvas, video, asciiFrame, this.options, performance.now());

    // 4. Pump to Recorder if active
    if (this.recorder.isRecording()) {
      this.recorder.drawFrame(this.canvas);
    }

    this.frameId = requestAnimationFrame(this.loop);
  };
}
