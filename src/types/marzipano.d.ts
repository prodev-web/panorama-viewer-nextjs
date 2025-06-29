// Type definitions for Marzipano library

declare namespace Marzipano {
  interface ViewerOptions {
    controls?: {
      mouseViewMode?: string;
    };
    stage?: {
      progressive?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Viewer {
    createScene(options: SceneOptions): Scene;
    destroy(): void;
  }

  interface SceneOptions {
    source: any;
    geometry: any;
    view: any;
    pinFirstLevel?: boolean;
  }

  interface Scene {
    switchTo(): void;
  }

  interface ImageUrlSource {
    static fromString(url: string): ImageUrlSource;
  }

  interface EquirectGeometry {
    new (levels: Array<{ width: number }>): EquirectGeometry;
  }

  interface RectilinearView {
    new (params: { yaw: number; pitch: number; fov: number }, limiter?: any): RectilinearView;
    static limit: {
      traditional(maxResolution: number, maxVFov: number): any;
    };
    setYaw(yaw: number): void;
    setPitch(pitch: number): void;
    setFov(fov: number): void;
    yaw(): number;
    pitch(): number;
    fov(): number;
  }
}

declare interface Window {
  Marzipano: typeof Marzipano;
}