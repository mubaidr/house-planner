// Konva event types for better type safety
import { KonvaEventObject } from 'konva/lib/Node';

export interface KonvaPointerEvent extends KonvaEventObject<PointerEvent> {
  target: {
    getStage: () => {
      getPointerPosition: () => { x: number; y: number };
    };
    opacity: (value?: number) => void;
  };
}

export interface KonvaDragEvent extends KonvaEventObject<DragEvent> {
  target: {
    getStage: () => {
      getPointerPosition: () => { x: number; y: number };
    };
    opacity: (value?: number) => void;
  };
  currentTarget: {
    opacity: (value?: number) => void;
  };
}