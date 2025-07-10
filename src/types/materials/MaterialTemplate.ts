export interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  materials: TemplateMaterial[];
  metadata: TemplateMetadata;
  isBuiltIn: boolean;
}

export interface TemplateMaterial {
  elementType: 'wall' | 'door' | 'window' | 'room' | 'floor' | 'ceiling';
  materialId: string;
  conditions?: MaterialCondition[];
  priority: number; // Higher priority materials override lower ones
}

export interface MaterialCondition {
  type: 'roomType' | 'elementProperty' | 'location';
  property: string;
  value: string | string[];
  operator: 'equals' | 'contains' | 'in' | 'not';
}

export interface TemplateMetadata {
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  style: DesignStyle;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedCost?: TemplateCost;
  usageCount: number;
  rating?: number;
}

export interface TemplateCost {
  min: number;
  max: number;
  currency: string;
  unit: 'sqft' | 'sqm' | 'total';
  lastCalculated: Date;
}

export type TemplateCategory = 
  | 'residential'
  | 'commercial'
  | 'modern'
  | 'traditional'
  | 'industrial'
  | 'luxury'
  | 'budget'
  | 'eco-friendly'
  | 'custom';

export type DesignStyle = 
  | 'modern'
  | 'contemporary'
  | 'traditional'
  | 'industrial'
  | 'scandinavian'
  | 'mediterranean'
  | 'rustic'
  | 'minimalist'
  | 'luxury'
  | 'eclectic';

export interface TemplateApplication {
  templateId: string;
  appliedAt: Date;
  elementsAffected: string[];
  materialsApplied: {
    elementId: string;
    elementType: string;
    materialId: string;
    previousMaterialId?: string;
  }[];
}

export interface TemplatePreview {
  id: string;
  name: string;
  thumbnail: string;
  style: DesignStyle;
  category: TemplateCategory;
  materialCount: number;
  estimatedCost?: string;
}