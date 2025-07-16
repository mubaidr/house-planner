
export interface Material {
  id: string;
  name: string;
  category: string;
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
  category: string;
  baseProperties: Partial<Material['properties']>;
  variations: {
    id: string;
    name: string;
    color?: string;
    texture?: string;
  }[];
}
