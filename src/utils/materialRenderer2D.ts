/**
 * Advanced Material Pattern System for 2D Rendering
 * 
 * This utility provides comprehensive material rendering patterns and effects
 * for both plan view and elevation view rendering in the 2D canvas system.
 */

import { Material, MaterialProperties } from '@/types/materials/Material';
import { ViewType2D } from '@/types/views';

// Pattern types for different material rendering styles
export type MaterialPatternType = 
  | 'solid'           // Solid color fill
  | 'hatch'           // Line hatching patterns
  | 'crosshatch'      // Cross-hatched patterns
  | 'stipple'         // Dotted/stippled patterns
  | 'texture'         // Image-based textures
  | 'gradient'        // Gradient fills
  | 'brick'           // Brick pattern
  | 'tile'            // Tile pattern
  | 'wood'            // Wood grain pattern
  | 'stone'           // Stone texture pattern
  | 'fabric'          // Fabric weave pattern
  | 'metal'           // Metal surface pattern
  | 'glass'           // Glass transparency pattern
  | 'custom';         // Custom pattern definition

// Pattern configuration for different material types
export interface MaterialPatternConfig {
  type: MaterialPatternType;
  scale: number;
  rotation: number;
  opacity: number;
  color: string;
  secondaryColor?: string;
  lineWidth?: number;
  spacing?: number;
  offset?: { x: number; y: number };
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'screen';
  seamless?: boolean;
}

// View-specific rendering settings
export interface ViewRenderingConfig {
  materialSettings: {
    patternScale: number;
    lineWidth: number;
    opacity: number;
    showTextures: boolean;
    showPatterns: boolean;
    detailLevel: 'low' | 'medium' | 'high';
  };
  hatchingSettings: {
    spacing: number;
    angle: number;
    lineWidth: number;
  };
  textureSettings: {
    resolution: number;
    filtering: 'nearest' | 'linear';
    mipmapping: boolean;
  };
}

// Default view configurations
export const PLAN_VIEW_MATERIAL_CONFIG: ViewRenderingConfig = {
  materialSettings: {
    patternScale: 0.5,
    lineWidth: 1,
    opacity: 0.8,
    showTextures: true,
    showPatterns: true,
    detailLevel: 'medium',
  },
  hatchingSettings: {
    spacing: 4,
    angle: 45,
    lineWidth: 0.5,
  },
  textureSettings: {
    resolution: 64,
    filtering: 'linear',
    mipmapping: true,
  },
};

export const ELEVATION_VIEW_MATERIAL_CONFIG: ViewRenderingConfig = {
  materialSettings: {
    patternScale: 1.0,
    lineWidth: 1.5,
    opacity: 0.9,
    showTextures: true,
    showPatterns: true,
    detailLevel: 'high',
  },
  hatchingSettings: {
    spacing: 3,
    angle: 45,
    lineWidth: 0.8,
  },
  textureSettings: {
    resolution: 128,
    filtering: 'linear',
    mipmapping: true,
  },
};

// Material pattern definitions
export const MATERIAL_PATTERNS: Record<string, MaterialPatternConfig> = {
  // Wall patterns
  'wall-drywall': {
    type: 'solid',
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#F8F8F8',
    seamless: true,
  },
  'wall-brick': {
    type: 'brick',
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#B85450',
    secondaryColor: '#8B4513',
    lineWidth: 1,
    spacing: 8,
    seamless: true,
  },
  'wall-stone': {
    type: 'stone',
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#A0A0A0',
    secondaryColor: '#808080',
    seamless: true,
  },
  'wall-concrete': {
    type: 'stipple',
    scale: 1,
    rotation: 0,
    opacity: 0.8,
    color: '#C0C0C0',
    spacing: 2,
    seamless: true,
  },

  // Floor patterns
  'floor-hardwood': {
    type: 'wood',
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#D2B48C',
    secondaryColor: '#8B7355',
    lineWidth: 0.5,
    spacing: 6,
    seamless: true,
  },
  'floor-tile': {
    type: 'tile',
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#E6E6E6',
    secondaryColor: '#D0D0D0',
    lineWidth: 1,
    spacing: 12,
    seamless: true,
  },
  'floor-carpet': {
    type: 'fabric',
    scale: 1,
    rotation: 0,
    opacity: 0.9,
    color: '#8B4513',
    spacing: 1,
    seamless: true,
  },

  // Door patterns
  'door-wood': {
    type: 'wood',
    scale: 1,
    rotation: 90,
    opacity: 1,
    color: '#8B4513',
    secondaryColor: '#654321',
    lineWidth: 0.8,
    spacing: 4,
    seamless: true,
  },
  'door-metal': {
    type: 'metal',
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#C0C0C0',
    secondaryColor: '#A0A0A0',
    seamless: true,
  },
  'door-glass': {
    type: 'glass',
    scale: 1,
    rotation: 0,
    opacity: 0.3,
    color: '#E0F0FF',
    seamless: true,
  },

  // Hatching patterns for technical drawings
  'hatch-general': {
    type: 'hatch',
    scale: 1,
    rotation: 45,
    opacity: 0.6,
    color: '#000000',
    lineWidth: 0.5,
    spacing: 3,
    seamless: true,
  },
  'hatch-insulation': {
    type: 'crosshatch',
    scale: 1,
    rotation: 45,
    opacity: 0.4,
    color: '#FF6B6B',
    lineWidth: 0.3,
    spacing: 2,
    seamless: true,
  },
  'hatch-concrete': {
    type: 'stipple',
    scale: 1,
    rotation: 0,
    opacity: 0.5,
    color: '#808080',
    spacing: 1.5,
    seamless: true,
  },
};

/**
 * Material Renderer 2D Class
 * Handles advanced material pattern rendering for 2D views
 */
export class MaterialRenderer2D {
  private viewConfig: ViewRenderingConfig;
  private patternCache: Map<string, HTMLCanvasElement> = new Map();

  constructor(viewType: ViewType2D | 'plan') {
    this.viewConfig = viewType === 'plan' 
      ? PLAN_VIEW_MATERIAL_CONFIG 
      : ELEVATION_VIEW_MATERIAL_CONFIG;
  }

  /**
   * Get material pattern configuration for a material
   */
  getMaterialPattern(material: Material): MaterialPatternConfig {
    // Try to find predefined pattern based on material category and properties
    const patternKey = this.getPatternKey(material);
    const predefinedPattern = MATERIAL_PATTERNS[patternKey];
    
    if (predefinedPattern) {
      return this.applyMaterialProperties(predefinedPattern, material);
    }

    // Generate pattern based on material properties
    return this.generatePatternFromMaterial(material);
  }

  /**
   * Generate Konva fill pattern properties for a material
   */
  getKonvaFillPattern(material: Material, scale: number = 1): any {
    const pattern = this.getMaterialPattern(material);
    const effectiveScale = pattern.scale * scale * this.viewConfig.materialSettings.patternScale;

    // Handle different pattern types
    switch (pattern.type) {
      case 'solid':
        return {
          fill: pattern.color,
          opacity: pattern.opacity * this.viewConfig.materialSettings.opacity,
        };

      case 'texture':
        if (material.texture) {
          return {
            fillPatternImage: this.loadTextureImage(material.texture),
            fillPatternScale: { x: effectiveScale, y: effectiveScale },
            fillPatternRotation: pattern.rotation,
            fillPatternOffset: pattern.offset || { x: 0, y: 0 },
            opacity: pattern.opacity * this.viewConfig.materialSettings.opacity,
          };
        }
        break;

      case 'hatch':
      case 'crosshatch':
      case 'stipple':
      case 'brick':
      case 'tile':
      case 'wood':
      case 'stone':
      case 'fabric':
      case 'metal':
        return {
          fillPatternImage: this.generatePatternCanvas(pattern, effectiveScale),
          fillPatternScale: { x: 1, y: 1 },
          fillPatternRotation: pattern.rotation,
          opacity: pattern.opacity * this.viewConfig.materialSettings.opacity,
        };

      case 'gradient':
        return this.generateGradientFill(pattern);

      case 'glass':
        return {
          fill: pattern.color,
          opacity: pattern.opacity * 0.3, // Glass is always more transparent
          stroke: pattern.secondaryColor || '#B0B0B0',
          strokeWidth: 0.5,
        };

      default:
        return {
          fill: material.color,
          opacity: this.viewConfig.materialSettings.opacity,
        };
    }

    // Fallback to solid color
    return {
      fill: material.color,
      opacity: this.viewConfig.materialSettings.opacity,
    };
  }

  /**
   * Generate pattern canvas for complex patterns
   */
  private generatePatternCanvas(pattern: MaterialPatternConfig, scale: number): HTMLCanvasElement {
    const cacheKey = `${pattern.type}-${pattern.color}-${pattern.rotation}-${scale}`;
    
    if (this.patternCache.has(cacheKey)) {
      return this.patternCache.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size based on pattern type and scale
    const size = this.getPatternSize(pattern.type, scale);
    canvas.width = size;
    canvas.height = size;

    // Generate pattern based on type
    switch (pattern.type) {
      case 'hatch':
        this.drawHatchPattern(ctx, pattern, size);
        break;
      case 'crosshatch':
        this.drawCrosshatchPattern(ctx, pattern, size);
        break;
      case 'stipple':
        this.drawStipplePattern(ctx, pattern, size);
        break;
      case 'brick':
        this.drawBrickPattern(ctx, pattern, size);
        break;
      case 'tile':
        this.drawTilePattern(ctx, pattern, size);
        break;
      case 'wood':
        this.drawWoodPattern(ctx, pattern, size);
        break;
      case 'stone':
        this.drawStonePattern(ctx, pattern, size);
        break;
      case 'fabric':
        this.drawFabricPattern(ctx, pattern, size);
        break;
      case 'metal':
        this.drawMetalPattern(ctx, pattern, size);
        break;
    }

    this.patternCache.set(cacheKey, canvas);
    return canvas;
  }

  /**
   * Draw hatching pattern
   */
  private drawHatchPattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    ctx.strokeStyle = pattern.color;
    ctx.lineWidth = pattern.lineWidth || 1;
    ctx.globalAlpha = pattern.opacity;

    const spacing = pattern.spacing || 4;
    const angle = (pattern.rotation * Math.PI) / 180;

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(angle);
    ctx.translate(-size / 2, -size / 2);

    for (let i = -size; i < size * 2; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw crosshatch pattern
   */
  private drawCrosshatchPattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    // Draw first set of lines
    this.drawHatchPattern(ctx, pattern, size);
    
    // Draw second set of lines perpendicular to first
    const crossPattern = { ...pattern, rotation: pattern.rotation + 90 };
    this.drawHatchPattern(ctx, crossPattern, size);
  }

  /**
   * Draw stipple pattern
   */
  private drawStipplePattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    ctx.fillStyle = pattern.color;
    ctx.globalAlpha = pattern.opacity;

    const spacing = pattern.spacing || 2;
    const dotSize = Math.max(0.5, spacing * 0.3);

    for (let x = 0; x < size; x += spacing) {
      for (let y = 0; y < size; y += spacing) {
        // Add some randomness to dot positions
        const offsetX = (Math.random() - 0.5) * spacing * 0.5;
        const offsetY = (Math.random() - 0.5) * spacing * 0.5;
        
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draw brick pattern
   */
  private drawBrickPattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    const brickWidth = pattern.spacing || 16;
    const brickHeight = brickWidth / 2;
    const mortarWidth = pattern.lineWidth || 1;

    ctx.fillStyle = pattern.color;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = pattern.secondaryColor || '#FFFFFF';
    ctx.lineWidth = mortarWidth;

    for (let y = 0; y < size; y += brickHeight + mortarWidth) {
      const offset = (Math.floor(y / (brickHeight + mortarWidth)) % 2) * (brickWidth / 2);
      
      for (let x = -brickWidth; x < size + brickWidth; x += brickWidth + mortarWidth) {
        // Draw mortar lines
        ctx.fillRect(x + offset, y, mortarWidth, brickHeight);
        ctx.fillRect(x + offset, y + brickHeight, brickWidth, mortarWidth);
      }
    }
  }

  /**
   * Draw tile pattern
   */
  private drawTilePattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    const tileSize = pattern.spacing || 12;
    const groutWidth = pattern.lineWidth || 1;

    ctx.fillStyle = pattern.color;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = pattern.secondaryColor || '#D0D0D0';

    for (let x = 0; x < size; x += tileSize + groutWidth) {
      for (let y = 0; y < size; y += tileSize + groutWidth) {
        // Draw grout lines
        ctx.fillRect(x + tileSize, y, groutWidth, tileSize + groutWidth);
        ctx.fillRect(x, y + tileSize, tileSize, groutWidth);
      }
    }
  }

  /**
   * Draw wood grain pattern
   */
  private drawWoodPattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    ctx.fillStyle = pattern.color;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = pattern.secondaryColor || '#8B7355';
    ctx.lineWidth = pattern.lineWidth || 0.5;
    ctx.globalAlpha = 0.6;

    const grainSpacing = pattern.spacing || 6;
    const isVertical = Math.abs(pattern.rotation % 180) < 45;

    if (isVertical) {
      for (let x = 0; x < size; x += grainSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        // Add some waviness to the grain
        for (let y = 0; y < size; y += 2) {
          const wave = Math.sin(y * 0.1) * 1;
          ctx.lineTo(x + wave, y);
        }
        ctx.stroke();
      }
    } else {
      for (let y = 0; y < size; y += grainSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < size; x += 2) {
          const wave = Math.sin(x * 0.1) * 1;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
    }
  }

  /**
   * Draw stone pattern
   */
  private drawStonePattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    ctx.fillStyle = pattern.color;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = pattern.secondaryColor || '#808080';
    ctx.lineWidth = pattern.lineWidth || 1;
    ctx.globalAlpha = 0.8;

    // Draw irregular stone shapes
    const numStones = Math.floor(size / 20);
    for (let i = 0; i < numStones; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 5 + Math.random() * 10;
      
      ctx.beginPath();
      // Create irregular stone shape
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const r = radius + (Math.random() - 0.5) * radius * 0.5;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        
        if (angle === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  /**
   * Draw fabric pattern
   */
  private drawFabricPattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    ctx.fillStyle = pattern.color;
    ctx.fillRect(0, 0, size, size);

    ctx.globalAlpha = 0.3;
    const weaveSize = pattern.spacing || 2;

    // Create weave pattern
    for (let x = 0; x < size; x += weaveSize * 2) {
      for (let y = 0; y < size; y += weaveSize * 2) {
        ctx.fillStyle = pattern.secondaryColor || '#000000';
        ctx.fillRect(x, y, weaveSize, weaveSize);
        ctx.fillRect(x + weaveSize, y + weaveSize, weaveSize, weaveSize);
      }
    }
  }

  /**
   * Draw metal pattern
   */
  private drawMetalPattern(ctx: CanvasRenderingContext2D, pattern: MaterialPatternConfig, size: number): void {
    // Create metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, pattern.color);
    gradient.addColorStop(0.5, pattern.secondaryColor || '#FFFFFF');
    gradient.addColorStop(1, pattern.color);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle texture lines
    ctx.strokeStyle = pattern.secondaryColor || '#FFFFFF';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.2;

    for (let i = 0; i < size; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }
  }

  /**
   * Generate gradient fill for materials
   */
  private generateGradientFill(pattern: MaterialPatternConfig): any {
    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 100, y: 100 },
      fillLinearGradientColorStops: [
        0, pattern.color,
        1, pattern.secondaryColor || pattern.color
      ],
      opacity: pattern.opacity,
    };
  }

  /**
   * Get pattern size based on type and scale
   */
  private getPatternSize(type: MaterialPatternType, scale: number): number {
    const baseSize = {
      hatch: 16,
      crosshatch: 16,
      stipple: 12,
      brick: 32,
      tile: 24,
      wood: 20,
      stone: 40,
      fabric: 8,
      metal: 16,
    }[type] || 16;

    return Math.max(8, Math.floor(baseSize * scale));
  }

  /**
   * Get pattern key for material lookup
   */
  private getPatternKey(material: Material): string {
    const category = material.category;
    const name = material.name.toLowerCase();

    // Try specific material name patterns first
    if (name.includes('brick')) return 'wall-brick';
    if (name.includes('stone')) return 'wall-stone';
    if (name.includes('concrete')) return 'wall-concrete';
    if (name.includes('hardwood') || name.includes('wood')) return category === 'floor' ? 'floor-hardwood' : 'door-wood';
    if (name.includes('tile')) return 'floor-tile';
    if (name.includes('carpet')) return 'floor-carpet';
    if (name.includes('metal')) return 'door-metal';
    if (name.includes('glass')) return 'door-glass';

    // Fallback to category-based patterns
    return `${category}-${category === 'wall' ? 'drywall' : category === 'floor' ? 'tile' : 'wood'}`;
  }

  /**
   * Apply material properties to pattern configuration
   */
  private applyMaterialProperties(pattern: MaterialPatternConfig, material: Material): MaterialPatternConfig {
    return {
      ...pattern,
      color: material.color,
      scale: (material.properties.patternScale || 1) * pattern.scale,
      rotation: (material.properties.patternRotation || 0) + pattern.rotation,
      opacity: (material.properties.opacity || 1) * pattern.opacity,
    };
  }

  /**
   * Generate pattern from material properties when no predefined pattern exists
   */
  private generatePatternFromMaterial(material: Material): MaterialPatternConfig {
    const props = material.properties;
    
    // Determine pattern type based on material properties
    let patternType: MaterialPatternType = 'solid';
    
    if (material.texture) {
      patternType = 'texture';
    } else if (props.roughness > 0.8) {
      patternType = 'stipple';
    } else if (props.metallic > 0.5) {
      patternType = 'metal';
    } else if (props.opacity < 0.8) {
      patternType = 'glass';
    }

    return {
      type: patternType,
      scale: props.patternScale || 1,
      rotation: props.patternRotation || 0,
      opacity: props.opacity || 1,
      color: material.color,
      seamless: props.seamless !== false,
    };
  }

  /**
   * Load texture image for pattern rendering
   */
  private loadTextureImage(textureUrl: string): HTMLImageElement {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const image = new Image() as any;
    img.src = textureUrl;
    return img;
  }

  /**
   * Clear pattern cache
   */
  clearCache(): void {
    this.patternCache.clear();
  }

  /**
   * Update view configuration
   */
  updateViewConfig(config: Partial<ViewRenderingConfig>): void {
    this.viewConfig = { ...this.viewConfig, ...config };
    this.clearCache(); // Clear cache when config changes
  }
}

/**
 * Utility functions for material pattern rendering
 */
export const MaterialPatternUtils = {
  /**
   * Get material pattern for specific view type
   */
  getPatternForView(material: Material, viewType: ViewType2D | 'plan', scale: number = 1): any {
    const renderer = new MaterialRenderer2D(viewType);
    return renderer.getKonvaFillPattern(material, scale);
  },

  /**
   * Check if material should show pattern in current view
   */
  shouldShowPattern(material: Material, viewType: ViewType2D | 'plan', detailLevel: 'low' | 'medium' | 'high'): boolean {
    if (detailLevel === 'low') return false;
    if (material.properties.seamless === false && detailLevel === 'medium') return false;
    return true;
  },

  /**
   * Get simplified pattern for low detail rendering
   */
  getSimplifiedPattern(material: Material): any {
    return {
      fill: material.color,
      opacity: material.properties.opacity || 1,
    };
  },

  /**
   * Generate pattern preview for material library
   */
  generatePatternPreview(material: Material, size: number = 64): HTMLCanvasElement {
    const renderer = new MaterialRenderer2D('plan');
    const pattern = renderer.getMaterialPattern(material);
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d')!;
    
    if (pattern.type === 'solid') {
      ctx.fillStyle = pattern.color;
      ctx.fillRect(0, 0, size, size);
    } else {
      const patternCanvas = renderer['generatePatternCanvas'](pattern, 1);
      const patternObj = ctx.createPattern(patternCanvas, 'repeat');
      if (patternObj) {
        ctx.fillStyle = patternObj;
        ctx.fillRect(0, 0, size, size);
      }
    }
    
    return canvas;
  },
};

export default MaterialRenderer2D;