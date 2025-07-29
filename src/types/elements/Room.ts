export interface Room {
  id: string;
  name?: string;
  points: { x: number; y: number }[];
  vertices?: { x: number; y: number }[]; // For backward compatibility
  area?: number;
  perimeter?: number;
  center?: { x: number; y: number };
  walls?: string[]; // Wall IDs that form this room
  material?: string;
  materialId?: string;
  color?: string;
  floorId?: string;
  roomType?: string;
  isCustomNamed?: boolean;
}

export interface RoomCreateData {
  name?: string;
  points: { x: number; y: number }[];
  area?: number;
  material?: string;
  color?: string;
}
