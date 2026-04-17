export class CameraManager {
  private static instance: CameraManager;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  private constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.setAttribute('autoplay', '');
    this.videoElement.setAttribute('muted', '');
    this.videoElement.style.position = 'fixed';
    this.videoElement.style.top = '-1000px';
    this.videoElement.style.left = '-1000px';
    this.videoElement.style.opacity = '0';
    document.body.appendChild(this.videoElement);
  }

  public static getInstance(): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance;
  }

  public async start(constraints: MediaStreamConstraints = { 
    video: { 
      width: { ideal: 640 }, 
      height: { ideal: 480 },
      facingMode: 'user'
    } 
  }): Promise<HTMLVideoElement> {
    if (this.stream) this.stop();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await new Promise<void>((resolve) => {
          if (!this.videoElement) return resolve();
          this.videoElement.onloadedmetadata = () => {
            this.videoElement?.play();
            resolve();
          };
        });
        return this.videoElement;
      }
      throw new Error("Video element not initialized");
    } catch (error) {
      console.error("CameraManager Error:", error);
      throw error;
    }
  }

  public stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public getVideo(): HTMLVideoElement | null {
    return this.videoElement;
  }

  public isActive(): boolean {
    return !!this.stream && this.stream.active;
  }
}
