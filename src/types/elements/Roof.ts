export interface Roof {
  id: string;
  points: Array<{ x: number; y: number }>; // Roof outline points
  height: number;
  pitch: number; // Roof pitch in degrees
  overhang: number; // Overhang distance
  type: 'gable' | 'hip' | 'shed' | 'flat' | 'mansard';
  material?: string;
  materialId?: string;
  color: string;
  ridgeHeight: number;
  gutterHeight: number;
  floorId?: string; // For multi-story support
}

export interface RoofCreateData {
  points: Array<{ x: number; y: number }>;
  height?: number;
  pitch?: number;
  overhang?: number;
  type?: 'gable' | 'hip' | 'shed' | 'flat' | 'mansard';
  material?: string;
  color?: string;
  ridgeHeight?: number;
  gutterHeight?: number;
  floorId?: string;
}