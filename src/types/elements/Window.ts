export interface Window {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  wallId: string;
  wallAngle: number; // Angle of the parent wall in radians
  style: 'single' | 'double' | 'casement';
  material?: string;
  color: string;
  opacity: number;
}

export interface WindowCreateData {
  x: number;
  y: number;
  width?: number;
  height?: number;
  wallId: string;
  wallAngle?: number; // Angle of the parent wall in radians
  style?: 'single' | 'double' | 'casement';
  material?: string;
  color?: string;
  opacity?: number;
}