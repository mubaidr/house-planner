import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export interface ExportOptions {
  format: 'gltf' | 'obj' | 'fbx';
  binary?: boolean;
  embedImages?: boolean;
  includeCustomExtensions?: boolean;
}

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
  transparent?: boolean;
}

export interface FloorPlanOptions {
  scale?: number;
  showDimensions?: boolean;
  showLabels?: boolean;
  lineWidth?: number;
  backgroundColor?: string;
}

export class Export3DSystem {
  private renderer: THREE.WebGLRenderer | null = null;
  private originalSettings: any = {};

  setRenderer(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
  }

  async exportGLTF(scene: THREE.Scene, options: Partial<ExportOptions> = {}): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();

      const exportOptions = {
        binary: options.binary ?? false,
        embedImages: options.embedImages ?? true,
        includeCustomExtensions: options.includeCustomExtensions ?? false,
        ...options,
      };

      exporter.parse(
        scene,
        gltf => {
          let content: string | ArrayBuffer;
          if (exportOptions.binary) {
            content = gltf as ArrayBuffer;
          } else {
            content = JSON.stringify(gltf);
          }
          const mimeType = exportOptions.binary ? 'application/octet-stream' : 'application/json';
          const blob = new Blob([content], { type: mimeType });
          resolve(blob);
        },
        error => {
          console.error('Error exporting GLTF:', error);
          reject(error);
        },
        exportOptions
      );
    });
  }

  async exportOBJ(scene: THREE.Scene): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const exporter = new OBJExporter();
        const objString = exporter.parse(scene);
        const blob = new Blob([objString], { type: 'text/plain' });
        resolve(blob);
      } catch (error) {
        console.error('Error exporting OBJ:', error);
        reject(error);
      }
    });
  }

  async exportScreenshot(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions = {}
  ): Promise<Blob> {
    const {
      width = 1920,
      height = 1080,
      quality = 0.95,
      format = 'png',
      transparent = false,
    } = options;

    return new Promise((resolve, reject) => {
      try {
        // Create a temporary canvas for high-resolution rendering
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;

        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D context'));
          return;
        }

        // Set background if not transparent
        if (!transparent) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw the original canvas scaled to the new size
        ctx.drawImage(canvas, 0, 0, width, height);

        // Convert to blob
        tempCanvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async exportHighQualityRender(
    scene: THREE.Scene,
    camera: THREE.Camera,
    options: ScreenshotOptions = {}
  ): Promise<Blob> {
    if (!this.renderer) {
      throw new Error('Renderer not set. Call setRenderer() first.');
    }

    const { width = 3840, height = 2160, quality = 1.0, format = 'png' } = options;

    // Store original settings
    this.originalSettings = {
      pixelRatio: this.renderer.getPixelRatio(),
      size: this.renderer.getSize(new THREE.Vector2()),
      shadowMapEnabled: this.renderer.shadowMap.enabled,
      shadowMapType: this.renderer.shadowMap.type,
      toneMapping: this.renderer.toneMapping,
      toneMappingExposure: this.renderer.toneMappingExposure,
    };

    try {
      // Set high-quality settings
      this.renderer.setPixelRatio(2);
      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      // Render the scene
      this.renderer.render(scene, camera);

      // Capture the image
      const blob = await this.exportScreenshot(this.renderer.domElement, {
        width,
        height,
        quality,
        format,
      });

      return blob;
    } finally {
      // Restore original settings
      this.restoreOriginalSettings();
    }
  }

  async export2DFloorPlan(scene: THREE.Scene, options: FloorPlanOptions = {}): Promise<Blob> {
    const {
      scale = 100,
      showDimensions = true,
      showLabels = true,
      lineWidth = 2,
      backgroundColor = '#ffffff',
    } = options;

    // Create a 2D canvas for floor plan
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = lineWidth;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // Extract walls and rooms from the scene
    const walls: any[] = [];
    const rooms: any[] = [];

    scene.traverse(object => {
      if (object.userData.type === 'wall') {
        walls.push(object.userData);
      } else if (object.userData.type === 'room') {
        rooms.push(object.userData);
      }
    });

    // Draw rooms (as filled areas)
    ctx.fillStyle = '#f0f0f0';
    rooms.forEach(room => {
      if (room.points && room.points.length > 0) {
        ctx.beginPath();
        room.points.forEach((point: any, index: number) => {
          const x = point.x * scale + canvas.width / 2;
          const y = point.z * scale + canvas.height / 2;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Add room label if enabled
        if (showLabels && room.name) {
          const centerX =
            room.points.reduce((sum: number, p: any) => sum + p.x, 0) / room.points.length;
          const centerZ =
            room.points.reduce((sum: number, p: any) => sum + p.z, 0) / room.points.length;

          ctx.fillStyle = '#000000';
          ctx.fillText(
            room.name,
            centerX * scale + canvas.width / 2,
            centerZ * scale + canvas.height / 2
          );
        }
      }
    });

    // Draw walls
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = lineWidth * 2;

    walls.forEach(wall => {
      if (wall.start && wall.end) {
        const startX = wall.start.x * scale + canvas.width / 2;
        const startY = wall.start.z * scale + canvas.height / 2;
        const endX = wall.end.x * scale + canvas.width / 2;
        const endY = wall.end.z * scale + canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Add dimensions if enabled
        if (showDimensions) {
          const length = Math.sqrt(
            Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
          );

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          ctx.fillStyle = '#666666';
          ctx.font = '10px Arial';
          ctx.fillText(`${length.toFixed(1)}m`, midX, midY - 5);
        }
      }
    });

    // Add grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create floor plan blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  }

  private restoreOriginalSettings() {
    if (!this.renderer || !this.originalSettings) return;

    this.renderer.setPixelRatio(this.originalSettings.pixelRatio);
    this.renderer.setSize(this.originalSettings.size.x, this.originalSettings.size.y);
    this.renderer.shadowMap.enabled = this.originalSettings.shadowMapEnabled;
    this.renderer.shadowMap.type = this.originalSettings.shadowMapType;
    this.renderer.toneMapping = this.originalSettings.toneMapping;
    this.renderer.toneMappingExposure = this.originalSettings.toneMappingExposure;
  }
}
