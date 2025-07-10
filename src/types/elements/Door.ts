export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  wallId: string;
  wallAngle: number; // Angle of the parent wall in radians
  swingDirection: 'left' | 'right' | 'inward' | 'outward';
  style: 'single' | 'double' | 'sliding';
  material?: string;
  color: string;
}

export interface DoorCreateData {
  x: number;
  y: number;
  width?: number;
  height?: number;
  wallId: string;
  wallAngle?: number; // Angle of the parent wall in radians
  swingDirection?: 'left' | 'right' | 'inward' | 'outward';
  style?: 'single' | 'double' | 'sliding';
  material?: string;
  color?: string;
}