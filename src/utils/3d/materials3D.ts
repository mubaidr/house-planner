import {
  Material3DConfig,
  MaterialCategory,
  MaterialContext,
  MaterialLibrary,
} from '@/types/materials3D';
import * as THREE from 'three';

export class Material3DSystem {
  private materials = new Map<string, THREE.Material>();
  private textures = new Map<string, THREE.Texture>();
  private textureLoader = new THREE.TextureLoader();
  private libraries = new Map<MaterialCategory, MaterialLibrary>();

  constructor() {
    this.initializeDefaultLibraries();
  }

  // Create PBR Material from Configuration
  async createPBRMaterial(config: Material3DConfig): Promise<THREE.MeshStandardMaterial> {
    // Check if material already exists
    if (this.materials.has(config.id)) {
      return this.materials.get(config.id) as THREE.MeshStandardMaterial;
    }

    const material = new THREE.MeshStandardMaterial({
      name: config.name,
      color: new THREE.Color(config.baseColor),
      roughness: config.roughness,
      metalness: config.metalness,
      transparent: config.opacity < 1,
      opacity: config.opacity,
    });

    // Set emissive properties
    if (config.emissive) {
      material.emissive = new THREE.Color(config.emissive);
      material.emissiveIntensity = config.emissiveIntensity || 0;
    }

    // Set advanced PBR properties
    if (config.clearcoat !== undefined) {
      (material as any).clearcoat = config.clearcoat;
    }
    if (config.clearcoatRoughness !== undefined) {
      (material as any).clearcoatRoughness = config.clearcoatRoughness;
    }
    if (config.transmission !== undefined) {
      (material as any).transmission = config.transmission;
    }
    if (config.thickness !== undefined) {
      (material as any).thickness = config.thickness;
    }
    if (config.ior !== undefined) {
      (material as any).ior = config.ior;
    }

    // Load and apply textures
    await this.applyTextures(material, config);

    // Cache the material
    this.materials.set(config.id, material);

    return material;
  }

  // Apply textures to material
  private async applyTextures(
    material: THREE.MeshStandardMaterial,
    config: Material3DConfig
  ): Promise<void> {
    const texturePromises: Promise<void>[] = [];

    // Diffuse/Albedo map
    if (config.diffuseMap) {
      texturePromises.push(
        this.loadTexture(config.diffuseMap).then(texture => {
          this.configureTexture(texture, config);
          material.map = texture;
          material.needsUpdate = true;
        })
      );
    }

    // Normal map
    if (config.normalMap) {
      texturePromises.push(
        this.loadTexture(config.normalMap).then(texture => {
          this.configureTexture(texture, config);
          material.normalMap = texture;
          material.needsUpdate = true;
        })
      );
    }

    // Roughness map
    if (config.roughnessMap) {
      texturePromises.push(
        this.loadTexture(config.roughnessMap).then(texture => {
          this.configureTexture(texture, config);
          material.roughnessMap = texture;
          material.needsUpdate = true;
        })
      );
    }

    // Metalness map
    if (config.metalnessMap) {
      texturePromises.push(
        this.loadTexture(config.metalnessMap).then(texture => {
          this.configureTexture(texture, config);
          material.metalnessMap = texture;
          material.needsUpdate = true;
        })
      );
    }

    // Ambient Occlusion map
    if (config.aoMap) {
      texturePromises.push(
        this.loadTexture(config.aoMap).then(texture => {
          this.configureTexture(texture, config);
          material.aoMap = texture;
          material.aoMapIntensity = 1;
          material.needsUpdate = true;
        })
      );
    }

    // Displacement map
    if (config.displacementMap) {
      texturePromises.push(
        this.loadTexture(config.displacementMap).then(texture => {
          this.configureTexture(texture, config);
          material.displacementMap = texture;
          material.displacementScale = 0.1;
          material.needsUpdate = true;
        })
      );
    }

    // Emissive map
    if (config.emissiveMap) {
      texturePromises.push(
        this.loadTexture(config.emissiveMap).then(texture => {
          this.configureTexture(texture, config);
          material.emissiveMap = texture;
          material.needsUpdate = true;
        })
      );
    }

    await Promise.all(texturePromises);
  }

  // Load texture with caching
  private async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.textures.has(url)) {
      return this.textures.get(url)!;
    }

    try {
      const texture = await this.textureLoader.loadAsync(url);
      this.textures.set(url, texture);
      return texture;
    } catch (error) {
      console.warn(`Failed to load texture: ${url}`, error);
      // Return a default texture
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(0, 0, 1, 1);
      const fallbackTexture = new THREE.CanvasTexture(canvas);
      this.textures.set(url, fallbackTexture);
      return fallbackTexture;
    }
  }

  // Configure texture properties
  private configureTexture(texture: THREE.Texture, config: Material3DConfig): void {
    // Set wrapping
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    // Set repeat
    if (config.textureRepeat) {
      texture.repeat.set(config.textureRepeat.u, config.textureRepeat.v);
    }

    // Set offset
    if (config.textureOffset) {
      texture.offset.set(config.textureOffset.u, config.textureOffset.v);
    }

    // Set rotation
    if (config.textureRotation) {
      texture.rotation = config.textureRotation;
    }

    // Optimize texture settings
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = false;
  }

  // Get material library for category
  getMaterialLibrary(category: MaterialCategory): MaterialLibrary | undefined {
    return this.libraries.get(category);
  }

  // Add custom material to library
  addMaterialToLibrary(material: Material3DConfig): void {
    let library = this.libraries.get(material.category);
    if (!library) {
      library = {
        category: material.category,
        materials: [],
      };
      this.libraries.set(material.category, library);
    }

    // Remove existing material with same ID
    library.materials = library.materials.filter(m => m.id !== material.id);
    library.materials.push(material);
  }

  // Apply material to geometry with context
  applyMaterialToGeometry(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    context: MaterialContext
  ): void {
    // Apply UV mapping based on context
    if (context.uvMapping && context.uvMapping !== 'planar') {
      this.generateUVMapping(geometry, context.uvMapping);
    }
  }

  // Generate UV mapping
  private generateUVMapping(geometry: THREE.BufferGeometry, mapping: string): void {
    switch (mapping) {
      case 'cylindrical':
        // Implement cylindrical UV mapping
        break;
      case 'spherical':
        // Implement spherical UV mapping
        break;
      case 'box':
        // Implement box UV mapping
        break;
      default:
        // Use default planar mapping
        break;
    }
  }

  // Initialize default material libraries
  private initializeDefaultLibraries(): void {
    // Wall Materials
    this.libraries.set('wall', {
      category: 'wall',
      materials: [
        {
          id: 'wall-brick-red',
          name: 'Red Brick',
          category: 'wall',
          baseColor: '#8B4513',
          roughness: 0.8,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 4, v: 2 },
        },
        {
          id: 'wall-concrete',
          name: 'Concrete',
          category: 'wall',
          baseColor: '#808080',
          roughness: 0.9,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 2, v: 2 },
        },
        {
          id: 'wall-wood-panel',
          name: 'Wood Panel',
          category: 'wall',
          baseColor: '#DEB887',
          roughness: 0.7,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 1, v: 4 },
        },
      ],
    });

    // Floor Materials
    this.libraries.set('floor', {
      category: 'floor',
      materials: [
        {
          id: 'floor-hardwood',
          name: 'Hardwood',
          category: 'floor',
          baseColor: '#8B4513',
          roughness: 0.6,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 8, v: 1 },
        },
        {
          id: 'floor-tile-ceramic',
          name: 'Ceramic Tile',
          category: 'floor',
          baseColor: '#F5F5DC',
          roughness: 0.2,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 8, v: 8 },
        },
        {
          id: 'floor-carpet',
          name: 'Carpet',
          category: 'floor',
          baseColor: '#696969',
          roughness: 1.0,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 4, v: 4 },
        },
      ],
    });

    // Door Materials
    this.libraries.set('door', {
      category: 'door',
      materials: [
        {
          id: 'door-wood-oak',
          name: 'Oak Wood',
          category: 'door',
          baseColor: '#8B4513',
          roughness: 0.7,
          metalness: 0.0,
          opacity: 1,
        },
        {
          id: 'door-metal-steel',
          name: 'Steel',
          category: 'door',
          baseColor: '#708090',
          roughness: 0.3,
          metalness: 0.8,
          opacity: 1,
        },
        {
          id: 'door-glass',
          name: 'Glass Door',
          category: 'door',
          baseColor: '#87CEEB',
          roughness: 0.1,
          metalness: 0.0,
          opacity: 0.3,
          transmission: 0.9,
        },
      ],
    });

    // Window Materials
    this.libraries.set('window', {
      category: 'window',
      materials: [
        {
          id: 'window-clear-glass',
          name: 'Clear Glass',
          category: 'window',
          baseColor: '#87CEEB',
          roughness: 0.1,
          metalness: 0.0,
          opacity: 0.3,
          transmission: 0.9,
          ior: 1.5,
        },
        {
          id: 'window-tinted-glass',
          name: 'Tinted Glass',
          category: 'window',
          baseColor: '#2F4F4F',
          roughness: 0.1,
          metalness: 0.0,
          opacity: 0.5,
          transmission: 0.7,
          ior: 1.5,
        },
      ],
    });

    // Roof Materials
    this.libraries.set('roof', {
      category: 'roof',
      materials: [
        {
          id: 'roof-shingle-asphalt',
          name: 'Asphalt Shingles',
          category: 'roof',
          baseColor: '#2F4F4F',
          roughness: 0.9,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 8, v: 4 },
        },
        {
          id: 'roof-tile-clay',
          name: 'Clay Tiles',
          category: 'roof',
          baseColor: '#CD853F',
          roughness: 0.8,
          metalness: 0.0,
          opacity: 1,
          textureRepeat: { u: 6, v: 3 },
        },
        {
          id: 'roof-metal',
          name: 'Metal Roofing',
          category: 'roof',
          baseColor: '#708090',
          roughness: 0.4,
          metalness: 0.7,
          opacity: 1,
          textureRepeat: { u: 4, v: 1 },
        },
      ],
    });
  }

  // Cleanup resources
  dispose(): void {
    this.materials.forEach(material => material.dispose());
    this.textures.forEach(texture => texture.dispose());
    this.materials.clear();
    this.textures.clear();
  }
}

// Singleton instance
export const material3DSystem = new Material3DSystem();
