// Konva event types for better type safety
import { Node } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { Shape } from 'konva/lib/Shape';

// Custom event interfaces that don't conflict with Konva's inheritance
export interface KonvaPointerEvent {
  target: Shape | Stage;
  currentTarget: Shape | Stage;
  evt: PointerEvent;
}

export interface KonvaDragEvent {
  target: Shape | Stage;
  currentTarget: Shape | Stage;
  evt: DragEvent;
}

// Re-export for convenience
export type KonvaNode = Node;
