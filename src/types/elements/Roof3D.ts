import { Vector3 } from '@/types/scene3D';

export interface Roof {
  id: string;
  points: Vector3[]; // Points defining the roof shape
  type: 'flat' | 'gable' | 'hip' | 'mansard';
  materialId?: string;
  height?: number; // For non-flat roofs
}