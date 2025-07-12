import { useState, useCallback, useRef } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { DimensionAnnotation, createDimensionAnnotation, createAutoDimensions } from '@/components/Canvas/DimensionAnnotations';
import { snapPoint, getWallSnapPoints } from '@/utils/snapping';

interface DimensionToolState {
  annotations: DimensionAnnotation[];
  isCreating: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  showAll: boolean;
  selectedId: string | null;
}

export const useDimensionTool = () => {
  const [state, setState] = useState<DimensionToolState>({
    annotations: [],
    isCreating: false,
    startPoint: null,
    currentPoint: null,
    showAll: true,
    selectedId: null,
  });

  const { walls, doors, windows } = useDesignStore();
  const { activeTool, snapToGrid, gridSize } = useUIStore();
  const stateRef = useRef(state);
  stateRef.current = state;

  // Removed unused ref

  // Get snap points for dimension tool
  const getSnapPoint = useCallback((x: number, y: number) => {
    const snapPoints = getWallSnapPoints(walls);
    
    // Add door and window snap points
    doors.forEach(door => {
      const wall = walls.find(w => w.id === door.wallId);
      if (wall) {
        const wallLength = Math.sqrt(
          Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
        );
        const ratio = door.x / wallLength; // Using x coordinate as position along wall
        const doorX = wall.startX + (wall.endX - wall.startX) * ratio;
        const doorY = wall.startY + (wall.endY - wall.startY) * ratio;
        
        snapPoints.push(
          { x: doorX, y: doorY },
          { x: doorX + door.width * Math.cos(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)), 
            y: doorY + door.width * Math.sin(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)) }
        );
      }
    });

    windows.forEach(window => {
      const wall = walls.find(w => w.id === window.wallId);
      if (wall) {
        const wallLength = Math.sqrt(
          Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
        );
        const ratio = window.x / wallLength; // Using x coordinate as position along wall
        const windowX = wall.startX + (wall.endX - wall.startX) * ratio;
        const windowY = wall.startY + (wall.endY - wall.startY) * ratio;
        
        snapPoints.push(
          { x: windowX, y: windowY },
          { x: windowX + window.width * Math.cos(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)), 
            y: windowY + window.width * Math.sin(Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)) }
        );
      }
    });

    return snapPoint({ x, y }, gridSize, snapPoints, snapToGrid);
  }, [walls, doors, windows, gridSize, snapToGrid]);

  // Start creating a dimension
  const startDimension = useCallback((x: number, y: number) => {
    if (activeTool !== 'dimension') return;

    const snappedPoint = getSnapPoint(x, y);
    
    setState(prev => ({
      ...prev,
      isCreating: true,
      startPoint: snappedPoint,
      currentPoint: snappedPoint,
      selectedId: null,
    }));
  }, [activeTool, getSnapPoint]);

  // Update current dimension being created
  const updateDimension = useCallback((x: number, y: number) => {
    if (!stateRef.current.isCreating || activeTool !== 'dimension') return;

    const snappedPoint = getSnapPoint(x, y);
    
    setState(prev => ({
      ...prev,
      currentPoint: snappedPoint,
    }));
  }, [activeTool, getSnapPoint]);

  // Finish creating a dimension
  const finishDimension = useCallback(() => {
    const currentState = stateRef.current;
    
    if (!currentState.isCreating || !currentState.startPoint || !currentState.currentPoint) {
      return;
    }

    const distance = Math.sqrt(
      Math.pow(currentState.currentPoint.x - currentState.startPoint.x, 2) + 
      Math.pow(currentState.currentPoint.y - currentState.startPoint.y, 2)
    );

    // Only create dimension if there's meaningful distance
    if (distance > 10) {
      const newAnnotation = createDimensionAnnotation(
        currentState.startPoint,
        currentState.currentPoint,
        {
          isPermanent: true,
        }
      );

      setState(prev => ({
        ...prev,
        annotations: [...prev.annotations, newAnnotation],
        isCreating: false,
        startPoint: null,
        currentPoint: null,
      }));
    } else {
      // Cancel if distance is too small
      setState(prev => ({
        ...prev,
        isCreating: false,
        startPoint: null,
        currentPoint: null,
      }));
    }
  }, []);

  // Cancel dimension creation
  const cancelDimension = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: false,
      startPoint: null,
      currentPoint: null,
    }));
  }, []);

  // Update annotation
  const updateAnnotation = useCallback((annotations: DimensionAnnotation[]) => {
    setState(prev => ({
      ...prev,
      annotations,
    }));
  }, []);

  // Delete annotation
  const deleteAnnotation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  }, []);

  // Clear all annotations
  const clearAllAnnotations = useCallback(() => {
    setState(prev => ({
      ...prev,
      annotations: [],
      selectedId: null,
    }));
  }, []);

  // Toggle show all annotations
  const toggleShowAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAll: !prev.showAll,
    }));
  }, []);

  // Auto-dimension all walls
  const autoDimensionWalls = useCallback(() => {
    const autoAnnotations = createAutoDimensions(walls);
    
    setState(prev => ({
      ...prev,
      annotations: [...prev.annotations, ...autoAnnotations],
    }));
  }, [walls]);

  // Auto-dimension selected elements
  const autoDimensionSelected = useCallback((elementIds: string[], elementType: 'wall' | 'door' | 'window') => {
    const newAnnotations: DimensionAnnotation[] = [];
    
    elementIds.forEach(id => {
      let element: { id: string; startX?: number; startY?: number; endX?: number; endY?: number; wallId?: string; x?: number; width?: number } | undefined;
      let startPoint: { x: number; y: number } | undefined, endPoint: { x: number; y: number } | undefined;
      
      switch (elementType) {
        case 'wall':
          element = walls.find(w => w.id === id);
          if (element && element.startX !== undefined && element.startY !== undefined && element.endX !== undefined && element.endY !== undefined) {
            startPoint = { x: element.startX, y: element.startY };
            endPoint = { x: element.endX, y: element.endY };
          }
          break;
        case 'door':
          element = doors.find(d => d.id === id);
          if (element) {
            const wall = walls.find(w => w.id === element.wallId);
            if (wall) {
              const wallLength = Math.sqrt(
                Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
              );
              const ratio = element.position / wallLength;
              const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);
              
              startPoint = {
                x: wall.startX + (wall.endX - wall.startX) * ratio,
                y: wall.startY + (wall.endY - wall.startY) * ratio,
              };
              endPoint = {
                x: startPoint.x + element.width * Math.cos(angle),
                y: startPoint.y + element.width * Math.sin(angle),
              };
            }
          }
          break;
        case 'window':
          element = windows.find(w => w.id === id);
          if (element) {
            const wall = walls.find(w => w.id === element.wallId);
            if (wall) {
              const wallLength = Math.sqrt(
                Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
              );
              const ratio = element.position / wallLength;
              const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);
              
              startPoint = {
                x: wall.startX + (wall.endX - wall.startX) * ratio,
                y: wall.startY + (wall.endY - wall.startY) * ratio,
              };
              endPoint = {
                x: startPoint.x + element.width * Math.cos(angle),
                y: startPoint.y + element.width * Math.sin(angle),
              };
            }
          }
          break;
      }
      
      if (startPoint && endPoint) {
        const annotation = createDimensionAnnotation(startPoint, endPoint, {
          elementId: id,
          elementType,
        });
        newAnnotations.push(annotation);
      }
    });
    
    setState(prev => ({
      ...prev,
      annotations: [...prev.annotations, ...newAnnotations],
    }));
  }, [walls, doors, windows]);

  // Get current dimension being created
  const getCurrentDimension = useCallback(() => {
    if (!state.isCreating || !state.startPoint || !state.currentPoint) {
      return null;
    }

    const distance = Math.sqrt(
      Math.pow(state.currentPoint.x - state.startPoint.x, 2) + 
      Math.pow(state.currentPoint.y - state.startPoint.y, 2)
    );

    return {
      startPoint: state.startPoint,
      endPoint: state.currentPoint,
      distance,
      label: `${distance.toFixed(1)}cm`,
    };
  }, [state.isCreating, state.startPoint, state.currentPoint]);

  // Select annotation
  const selectAnnotation = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedId: id,
    }));
  }, []);

  return {
    state,
    startDimension,
    updateDimension,
    finishDimension,
    cancelDimension,
    updateAnnotation,
    deleteAnnotation,
    clearAllAnnotations,
    toggleShowAll,
    autoDimensionWalls,
    autoDimensionSelected,
    getCurrentDimension,
    selectAnnotation,
  };
};