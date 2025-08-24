import { Door, Stair, useDesignStore, Wall, Window } from '@/stores/designStore';
import { ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ElementManipulationToolProps {
  isActive: boolean;
  onDeactivate?: () => void;
}

type ManipulatableElement = Wall | Door | Window | Stair;

export function ElementManipulationTool3D({ isActive }: ElementManipulationToolProps) {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);
  const stairs = useDesignStore(state => state.stairs);
  const updateWall = useDesignStore(state => state.updateWall);
  const updateDoor = useDesignStore(state => state.updateDoor);
  const updateWindow = useDesignStore(state => state.updateWindow);
  const updateStair = useDesignStore(state => state.updateStair);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<THREE.Vector2 | null>(null);
  const [manipulationMode, setManipulationMode] = useState<'move' | 'rotate' | 'scale'>('move');

  const selectedElement = useRef<ManipulatableElement | null>(null);
  const initialElementState = useRef<ManipulatableElement | null>(null);

  // Find the selected element
  useEffect(() => {
    if (!selectedElementId || !selectedElementType) {
      selectedElement.current = null;
      return;
    }

    switch (selectedElementType) {
      case 'wall':
        selectedElement.current = walls.find(w => w.id === selectedElementId) ?? null;
        break;
      case 'door':
        selectedElement.current = doors.find(d => d.id === selectedElementId) ?? null;
        break;
      case 'window':
        selectedElement.current = windows.find(w => w.id === selectedElementId) ?? null;
        break;
      case 'stair':
        selectedElement.current = stairs.find(s => s.id === selectedElementId) ?? null;
        break;
      default:
        selectedElement.current = null;
    }
  }, [selectedElementId, selectedElementType, walls, doors, windows, stairs]);

  // Handle mouse movement for dragging
  const handleMouseMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!isDragging || !dragStart || !selectedElementId || !selectedElementType) return;

      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      switch (manipulationMode) {
        case 'move':
          // Handle movement logic
          if (selectedElementType === 'wall' && selectedElement.current) {
            const wall = selectedElement.current as Wall;
            const direction = new THREE.Vector2(
              wall.end.x - wall.start.x,
              wall.end.z - wall.start.z
            ).normalize();

            const delta = new THREE.Vector2(mouse.x - dragStart.x, mouse.y - dragStart.y);
            const moveDistance = delta.dot(direction);

            updateWall(selectedElementId, {
              start: {
                x: wall.start.x + direction.x * moveDistance,
                y: wall.start.y,
                z: wall.start.z + direction.y * moveDistance,
              },
              end: {
                x: wall.end.x + direction.x * moveDistance,
                y: wall.end.y,
                z: wall.end.z + direction.y * moveDistance,
              },
            });
          }
          break;

        case 'scale':
          // Handle scaling logic
          if (selectedElementType === 'wall' && selectedElement.current) {
            const wall = selectedElement.current as Wall;
            const direction = new THREE.Vector2(
              wall.end.x - wall.start.x,
              wall.end.z - wall.start.z
            ).normalize();

            const delta = new THREE.Vector2(mouse.x - dragStart.x, mouse.y - dragStart.y);
            const scaleAmount = delta.dot(direction);

            // Calculate new length
            const currentLength = Math.sqrt(
              Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
            );
            const newLength = Math.max(0.1, currentLength + scaleAmount);

            // Scale from center
            const center = new THREE.Vector2(
              (wall.start.x + wall.end.x) / 2,
              (wall.start.z + wall.end.z) / 2
            );

            updateWall(selectedElementId, {
              start: {
                x: center.x - (direction.x * newLength) / 2,
                y: wall.start.y,
                z: center.y - (direction.y * newLength) / 2,
              },
              end: {
                x: center.x + (direction.x * newLength) / 2,
                y: wall.end.y,
                z: center.y + (direction.y * newLength) / 2,
              },
            });
          }
          break;
      }
    },
    [isDragging, dragStart, manipulationMode, selectedElementType, selectedElementId, updateWall]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    initialElementState.current = null;
  }, []);

  // Handle escape key to cancel manipulation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDragging) {
        // Reset to initial state
        if (initialElementState.current && selectedElementId && selectedElementType) {
          switch (selectedElementType) {
            case 'wall':
              updateWall(selectedElementId, initialElementState.current as Wall);
              break;
            case 'door':
              updateDoor(selectedElementId, initialElementState.current as Door);
              break;
            case 'window':
              updateWindow(selectedElementId, initialElementState.current as Window);
              break;
            case 'stair':
              updateStair(selectedElementId, initialElementState.current as Stair);
              break;
          }
        }

        setIsDragging(false);
        setDragStart(null);
        initialElementState.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isDragging,
    selectedElementId,
    selectedElementType,
    updateWall,
    updateDoor,
    updateWindow,
    updateStair,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsDragging(false);
      setDragStart(null);
      initialElementState.current = null;
    };
  }, []);

  // Don't render anything if not active or no element selected
  if (!isActive || !selectedElementId || !selectedElementType || !selectedElement.current) {
    return null;
  }

  // Calculate position for the manipulation gizmo
  let gizmoPosition = new THREE.Vector3(0, 0, 0);

  switch (selectedElementType) {
    case 'wall': {
      const wall = selectedElement.current as Wall;
      gizmoPosition = new THREE.Vector3(
        (wall.start.x + wall.end.x) / 2,
        wall.height / 2,
        (wall.start.z + wall.end.z) / 2
      );
      break;
    }
    case 'door': {
      const door = selectedElement.current as Door;
      const doorWall = walls.find(w => w.id === door.wallId);
      if (doorWall) {
        const wallLength = Math.sqrt(
          Math.pow(doorWall.end.x - doorWall.start.x, 2) +
            Math.pow(doorWall.end.z - doorWall.start.z, 2)
        );

        const positionRatio = door.position / 100;
        const wallAngle = Math.atan2(
          doorWall.end.z - doorWall.start.z,
          doorWall.end.x - doorWall.start.x
        );

        gizmoPosition = new THREE.Vector3(
          doorWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
          door.height / 2,
          doorWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
        );
      }
      break;
    }
    case 'window': {
      const windowElement = selectedElement.current as Window;
      const windowWall = walls.find(w => w.id === windowElement.wallId);
      if (windowWall) {
        const wallLength = Math.sqrt(
          Math.pow(windowWall.end.x - windowWall.start.x, 2) +
            Math.pow(windowWall.end.z - windowWall.start.z, 2)
        );

        const positionRatio = windowElement.position / 100;
        const wallAngle = Math.atan2(
          windowWall.end.z - windowWall.start.z,
          windowWall.end.x - windowWall.start.x
        );

        gizmoPosition = new THREE.Vector3(
          windowWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
          windowElement.height / 2,
          windowWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
        );
      }
      break;
    }
    case 'stair': {
      const stair = selectedElement.current as Stair;
      gizmoPosition = new THREE.Vector3(
        (stair.start.x + stair.end.x) / 2,
        (stair.stepHeight * stair.steps) / 2,
        (stair.start.z + stair.end.z) / 2
      );
      break;
    }
  }

  return (
    <>
      {/* Manipulation gizmo */}
      <group position={gizmoPosition}>
        {/* Move handle (red) */}
        <mesh
          position={[1, 0, 0]}
          onClick={e => {
            e.stopPropagation();
            setManipulationMode('move');
          }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={manipulationMode === 'move' ? '#ff6b6b' : '#ff0000'}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Rotate handle (green) */}
        <mesh
          position={[0, 1, 0]}
          onClick={e => {
            e.stopPropagation();
            setManipulationMode('rotate');
          }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={manipulationMode === 'rotate' ? '#6bff6b' : '#00ff00'}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Scale handle (blue) */}
        <mesh
          position={[0, 0, 1]}
          onClick={e => {
            e.stopPropagation();
            setManipulationMode('scale');
          }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={manipulationMode === 'scale' ? '#6b6bff' : '#0000ff'}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Center sphere */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Event handlers for dragging */}
      <mesh
        position={[0, 10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
