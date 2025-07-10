export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  color: string;
  texture?: string; // URL or base64 texture image
  properties: MaterialProperties;
  cost?: MaterialCost;
  metadata: MaterialMetadata;
}

export interface MaterialProperties {
  // Visual properties
  opacity: number; // 0-1
  roughness: number; // 0-1 (0 = mirror, 1 = completely rough)
  metallic: number; // 0-1 (0 = non-metallic, 1 = metallic)
  reflectivity: number; // 0-1
  
  // Physical properties
  density?: number; // kg/m³
  thermalConductivity?: number; // W/m·K
  soundAbsorption?: number; // 0-1
  fireResistance?: FireRating;
  
  // Pattern properties
  patternScale?: number; // Scale factor for texture/pattern
  patternRotation?: number; // Rotation in degrees
  seamless?: boolean; // Whether texture tiles seamlessly
}

export interface MaterialCost {
  pricePerUnit: number;
  unit: 'sqft' | 'sqm' | 'linear_ft' | 'linear_m' | 'piece';
  currency: string;
  supplier?: string;
  lastUpdated: Date;
}

export interface MaterialMetadata {
  description: string;
  manufacturer?: string;
  productCode?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
  thumbnail?: string; // Small preview image
}

export type MaterialCategory = 
  | 'wall'
  | 'floor'
  | 'ceiling'
  | 'door'
  | 'window'
  | 'trim'
  | 'countertop'
  | 'cabinet'
  | 'tile'
  | 'wood'
  | 'metal'
  | 'glass'
  | 'stone'
  | 'fabric'
  | 'paint'
  | 'other';

export type FireRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'none';

export interface MaterialApplication {
  elementId: string;
  elementType: 'wall' | 'door' | 'window' | 'room';
  materialId: string;
  appliedAt: Date;
  coverage?: number; // Percentage of element covered (0-100)
  customProperties?: Partial<MaterialProperties>; // Override material properties
}

// Predefined material templates
export interface MaterialTemplate {
  id: string;
  name: string;
  category: MaterialCategory;
  baseProperties: MaterialProperties;
  variations: MaterialVariation[];
}

export interface MaterialVariation {
  id: string;
  name: string;
  color: string;
  texture?: string;
  propertyOverrides?: Partial<MaterialProperties>;
}