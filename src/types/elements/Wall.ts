export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  height: number;
  material?: string;
  materialId?: string;
  color: string;
}

export interface WallCreateData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness?: number;
  height?: number;
  material?: string;
  color?: string;
}