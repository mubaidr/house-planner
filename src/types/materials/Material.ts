
export type MaterialCategory =
  | 'wood'
  | 'metal'
  | 'concrete'
  | 'stone'
  | 'brick'
  | 'glass'
  | 'fabric'
  | 'ceramic'
  | 'plastic'
  | 'composite'
  | 'paint'
  | 'flooring'
  | 'roofing'
  | 'insulation'
  | 'wall'
  | 'siding'
  | 'other';export type MaterialProperties = Material['properties'];

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  color: string;
  textureImage?: string;
  bumpMapImage?: string;
  properties: {
    opacity: number;
    roughness: number;
    metallic: number;
    reflectivity: number;
    density?: number;
    thermalConductivity?: number;
    soundAbsorption?: number;
    fireResistance?: string;
    patternScale: number;
    patternRotation: number;
    seamless: boolean;
  };
  cost: {
    pricePerUnit: number;
    unit: string;
    currency: string;
    lastUpdated: Date;
    supplier?: string;
  };
  metadata: {
    description: string;
    manufacturer?: string;
    productCode?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isCustom: boolean;
  };
}

export interface MaterialTemplate {
  id: string;
  name: string;
  category: MaterialCategory;
  baseProperties: Partial<Material['properties']>;
  variations: {
    id: string;
    name: string;
    color?: string;
    texture?: string;
  }[];
}
