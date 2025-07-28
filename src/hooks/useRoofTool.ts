import { useState, useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Roof } from '@/types/elements/Roof';
import { snapPoint } from '@/utils/snapping';

export const useRoofTool = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [roofPoints, setRoofPoints] = useState<Array<{ x: number; y: number; snapped?: boolean; snapType?: string }>>([]);
  const [previewRoof, setPreviewRoof] = useState<Roof | null>(null);

  const { walls, addRoof, selectElement } = useDesignStore();
  const { currentFloorId, addElementToFloor } = useFloorStore();
  const { snapToGrid, gridSize, setActiveTool } = useUIStore();
  const { executeCommand } = useHistoryStore();

  const startDrawing = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Snap to grid or wall endpoints
    const snapPoints = walls.flatMap(wall => [
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY },
    ]);

    const snappedPos = snapPoint(pos, gridSize, snapPoints, snapToGrid);
    const pointWithSnap = { ...snappedPos, snapped: snapToGrid, snapType: 'grid' };

    if (!isDrawing) {
      // Start new roof
      setRoofPoints([pointWithSnap]);
      setIsDrawing(true);
    } else {
      // Add point to current roof
      const newPoints = [...roofPoints, pointWithSnap];
      setRoofPoints(newPoints);

      // Update preview
      if (newPoints.length >= 3) {
        const newRoof: Roof = {
          id: `roof-${Date.now()}`,
          points: newPoints,
          height: 300,
          pitch: 30,
          overhang: 50,
          type: 'gable',
          color: '#8B4513',
          ridgeHeight: 400,
          gutterHeight: 250,
          material: 'default',
          materialId: undefined,
          floorId: undefined,
        };
        setPreviewRoof(newRoof);
      }
    }
  }, [walls, snapToGrid, gridSize, isDrawing, roofPoints]);

  const updateDrawing = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || roofPoints.length === 0) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Update preview with current mouse position
    if (roofPoints.length >= 2) {
      const previewPoints = [...roofPoints, pos];
      const newRoof: Roof = {
        id: 'roof-preview',
        points: previewPoints,
        height: 300,
        pitch: 30,
        overhang: 50,
        type: 'gable',
        color: '#8B4513',
        ridgeHeight: 400,
        gutterHeight: 250,
        material: 'default',
        materialId: undefined,
        floorId: undefined,
      };
      setPreviewRoof(newRoof);
    }
  }, [isDrawing, roofPoints]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing || roofPoints.length < 3) return;

    const finalRoof: Roof = {
      id: `roof-${Date.now()}`,
      points: roofPoints,
      height: 300,
      pitch: 30,
      overhang: 50,
      type: 'gable',
      color: '#8B4513',
      ridgeHeight: 400,
      gutterHeight: 250,
      material: 'default',
      materialId: undefined,
      floorId: undefined,
    };

    executeCommand({
      execute: () => {
        addRoof(finalRoof);
        if (currentFloorId) {
          addElementToFloor(currentFloorId, 'roofs', finalRoof);
        }
      },
      undo: () => {
        // Remove roof logic would go here
      },
      description: 'Add roof',
    });

    // Reset state
    setIsDrawing(false);
    setRoofPoints([]);
    setPreviewRoof(null);
    setActiveTool('select');
    selectElement(finalRoof.id, 'roof');
  }, [isDrawing, roofPoints, executeCommand, addRoof, currentFloorId, addElementToFloor, setActiveTool, selectElement]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setRoofPoints([]);
    setPreviewRoof(null);
  }, []);

  const generateRoofFromWalls = useCallback(() => {
    if (walls.length === 0) return;

    // Get all wall endpoints
    const allPoints = walls.flatMap(wall => [
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY },
    ]);

    // Use convex hull to create roof outline
    const hull = convexHull(allPoints);

    if (hull.length >= 3) {
      const autoRoof: Roof = {
        id: `roof-${Date.now()}`,
        points: hull,
        height: 300,
        pitch: 30,
        overhang: 50,
        type: 'gable',
        color: '#8B4513',
        ridgeHeight: 400,
        gutterHeight: 250,
        material: 'default',
        materialId: undefined,
        floorId: undefined,
      };

      executeCommand({
        execute: () => {
          addRoof(autoRoof);
        },
        undo: () => {
          // Remove roof logic would go here
        },
        description: 'Generate roof from walls',
      });
    }
  }, [walls, addRoof, executeCommand]);

  return {
    isDrawing,
    roofPoints,
    previewRoof,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
    generateRoofFromWalls,
    generateFromWalls: generateRoofFromWalls, // Alias for tests
  };
};

// Simple convex hull algorithm (Gift wrapping)
function convexHull(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  if (points.length < 3) return points;

  // Find the leftmost point
  let leftmost = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x < points[leftmost].x) {
      leftmost = i;
    }
  }

  const hull: Array<{ x: number; y: number }> = [];
  let current = leftmost;

  do {
    hull.push(points[current]);
    let next = (current + 1) % points.length;

    for (let i = 0; i < points.length; i++) {
      if (orientation(points[current], points[i], points[next]) === 2) {
        next = i;
      }
    }

    current = next;
  } while (current !== leftmost);

  return hull;
}

function orientation(p: { x: number; y: number }, q: { x: number; y: number }, r: { x: number; y: number }): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0; // Collinear
  return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
}