export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  wallId: string;
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
  swingDirection?: 'left' | 'right' | 'inward' | 'outward';
  style?: 'single' | 'double' | 'sliding';
  material?: string;
  color?: string;
}