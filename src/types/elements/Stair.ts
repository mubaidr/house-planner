export interface Stair {
  id: string;
  x: number;
  y: number;
  width: number;
  length: number;
  steps: number;
  stepHeight: number;
  stepDepth: number;
  direction: 'up' | 'down';
  orientation: 'horizontal' | 'vertical';
  type: 'straight' | 'L-shaped' | 'U-shaped' | 'spiral';
  material?: string;
  materialId?: string;
  color: string;
  handrailLeft: boolean;
  handrailRight: boolean;
  floorId?: string; // For multi-story support
}

export interface StairCreateData {
  x: number;
  y: number;
  width?: number;
  length?: number;
  steps?: number;
  stepHeight?: number;
  stepDepth?: number;
  direction?: 'up' | 'down';
  orientation?: 'horizontal' | 'vertical';
  type?: 'straight' | 'L-shaped' | 'U-shaped' | 'spiral';
  material?: string;
  color?: string;
  handrailLeft?: boolean;
  handrailRight?: boolean;
  floorId?: string;
}