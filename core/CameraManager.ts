import { CameraDevice } from './types';

export class CameraManager {
  private static instance: CameraManager;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement;
  private currentDeviceId: string | null = null;

  private constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.setAttribute('autoplay', '');
    this.videoElement.setAttribute('muted', '');
    // Hidden style
    Object.assign(this.videoElement.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      top: '-10px',
      left: '-10px',
      opacity: '0',
      pointerEvents: 'none'
    });
    document.body.appendChild(this.videoElement);
  }

  public static getInstance(): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance;
  }

  public async getDevices(): Promise<CameraDevice[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 5)}`
      }));
  }

  public async start(deviceId?: string): Promise<HTMLVideoElement> {
    if (this.stream) this.stop();

    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      this.currentDeviceId = deviceId || null;

      await new Promise<void>((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });

      return this.videoElement;
    } catch (error) {
      console.error("CameraManager Error:", error);
      throw error;
    }
  }

  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.videoElement.srcObject = null;
  }

  public getVideo(): HTMLVideoElement {
    return this.videoElement;
  }

  public isActive(): boolean {
    return !!this.stream && this.stream.active;
  }

  public getCurrentDeviceId(): string | null {
    return this.currentDeviceId;
  }
}
