import { useDesignStore } from '@/stores/designStore';
import { useCallback, useEffect } from 'react';

interface CopyTool3DProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export function CopyTool3D({ isActive, onDeactivate }: CopyTool3DProps) {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);
  const stairs = useDesignStore(state => state.stairs);
  const addWall = useDesignStore(state => state.addWall);
  const addDoor = useDesignStore(state => state.addDoor);
  const addWindow = useDesignStore(state => state.addWindow);
  const addStair = useDesignStore(state => state.addStair);

  const copySelectedElement = useCallback(() => {
    if (!selectedElementId || !selectedElementType) return;

    const offset = 1; // Offset for copied element

    switch (selectedElementType) {
      case 'wall': {
        const wall = walls.find(w => w.id === selectedElementId);
        if (wall) {
          addWall({
            start: {
              x: wall.start.x + offset,
              y: wall.start.y,
              z: wall.start.z + offset,
            },
            end: {
              x: wall.end.x + offset,
              y: wall.end.y,
              z: wall.end.z + offset,
            },
            height: wall.height,
            thickness: wall.thickness,
            type: wall.type,
          });
        }
        break;
      }
      case 'door': {
        const door = doors.find(d => d.id === selectedElementId);
        if (door) {
          addDoor({
            wallId: door.wallId,
            position: Math.min(90, door.position + 10), // Slight offset along wall
            width: door.width,
            height: door.height,
            thickness: door.thickness,
            type: door.type,
            swingDirection: door.swingDirection,
            isOpen: door.isOpen,
            openAngle: door.openAngle,
            openOffset: door.openOffset,
          });
        }
        break;
      }
      case 'window': {
        const window = windows.find(w => w.id === selectedElementId);
        if (window) {
          addWindow({
            wallId: window.wallId,
            position: Math.min(90, window.position + 10), // Slight offset along wall
            width: window.width,
            height: window.height,
            thickness: window.thickness,
            type: window.type,
            glazing: window.glazing,
          });
        }
        break;
      }
      case 'stair': {
        const stair = stairs.find(s => s.id === selectedElementId);
        if (stair) {
          addStair({
            start: {
              x: stair.start.x + offset,
              y: stair.start.y,
              z: stair.start.z + offset,
            },
            end: {
              x: stair.end.x + offset,
              y: stair.end.y,
              z: stair.end.z + offset,
            },
            steps: stair.steps,
            stepHeight: stair.stepHeight,
            stepDepth: stair.stepDepth,
            width: stair.width,
            type: stair.type,
            radius: stair.radius,
            materialId: stair.materialId,
            railingHeight: stair.railingHeight,
            hasHandrail: stair.hasHandrail,
          });
        }
        break;
      }
    }

    onDeactivate();
  }, [
    selectedElementId,
    selectedElementType,
    walls,
    doors,
    windows,
    stairs,
    addWall,
    addDoor,
    addWindow,
    addStair,
    onDeactivate,
  ]);

  // Handle keyboard shortcut for copy
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        copySelectedElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, copySelectedElement]);

  // Auto-execute copy when tool becomes active
  useEffect(() => {
    if (isActive && selectedElementId) {
      copySelectedElement();
    }
  }, [isActive, selectedElementId, copySelectedElement]);

  return null; // This tool doesn't render anything visual
}
