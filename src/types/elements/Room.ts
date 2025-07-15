export interface Room {
  id: string;
  name?: string;
  points: { x: number; y: number }[];
  area?: number;
  material?: string;
  materialId?: string;
  color?: string;
  floorId?: string;
}

export interface RoomCreateData {
  name?: string;
  points: { x: number; y: number }[];
  area?: number;
  material?: string;
  color?: string;
}