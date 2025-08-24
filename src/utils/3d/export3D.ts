import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export class Export3DSystem {
  async exportGLTF(scene: THREE.Scene): Promise<Blob> {
    return new Promise(resolve => {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        gltf => {
          const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
          resolve(blob);
        },
        error => {
          console.error('Error exporting GLTF', error);
        }
      );
    });
  }

  async exportOBJ(scene: THREE.Scene): Promise<Blob> {
    return new Promise(resolve => {
      const exporter = new OBJExporter();
      const objString = exporter.parse(scene);
      const blob = new Blob([objString], { type: 'text/plain' });
      resolve(blob);
    });
  }
}
