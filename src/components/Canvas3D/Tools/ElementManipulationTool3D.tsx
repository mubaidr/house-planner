import { useDesignStore } from '@/stores/designStore';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ElementManipulationToolProps {
  isActive: boolean;
}

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

  const { camera, gl } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<THREE.Vector2 | null>(null);
  const [manipulationMode, setManipulationMode] = useState<'move' | 'rotate' | 'scale'>('move');

  const selectedElement = useRef<any>(null);
  const initialElementState = useRef<any>(null);

  // Find the selected element
  useEffect(() => {
    if (!selectedElementId || !selectedElementType) {
      selectedElement.current = null;
      return;
    }

    switch (selectedElementType) {
      case 'wall':
        selectedElement.current = walls.find(w => w.id === selectedElementId);
        break;
      case 'door':
        selectedElement.current = doors.find(d => d.id === selectedElementId);
        break;
      case 'window':
        selectedElement.current = windows.find(w => w.id === selectedElementId);
        break;
      case 'stair':
        selectedElement.current = stairs.find(s => s.id === selectedElementId);
        break;
      default:
        selectedElement.current = null;
    }
  }, [selectedElementId, selectedElementType, walls, doors, windows, stairs]);

  // Handle mouse down on the manipulation gizmo
  const handleMouseDown = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isActive || !selectedElement.current) return;

      event.stopPropagation();

      setIsDragging(true);
      setDragStart(new THREE.Vector2(event.clientX, event.clientY));
      initialElementState.current = { ...selectedElement.current };
    },
    [isActive]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isDragging || !dragStart || !selectedElement.current || !initialElementState.current)
        return;

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      // Convert screen movement to world movement
      const worldDelta = new THREE.Vector3(deltaX * 0.01, 0, deltaY * 0.01);

      // Apply transformation based on mode
      switch (manipulationMode) {
        case 'move':
          // Move the element
          if (selectedElementType === 'wall') {
            updateWall(selectedElementId!, {
              start: {
                x: initialElementState.current.start.x + worldDelta.x,
                y: initialElementState.current.start.y + worldDelta.y,
                z: initialElementState.current.start.z + worldDelta.z,
              },
              end: {
                x: initialElementState.current.end.x + worldDelta.x,
                y: initialElementState.current.end.y + worldDelta.y,
                z: initialElementState.current.end.z + worldDelta.z,
              },
            });
          } else if (selectedElementType === 'stair') {
            updateStair(selectedElementId!, {
              start: {
                x: initialElementState.current.start.x + worldDelta.x,
                y: initialElementState.current.start.y + worldDelta.y,
                z: initialElementState.current.start.z + worldDelta.z,
              },
              end: {
                x: initialElementState.current.end.x + worldDelta.x,
                y: initialElementState.current.end.y + worldDelta.y,
                z: initialElementState.current.end.z + worldDelta.z,
              },
            });
          }
          break;

        case 'rotate':
          // Rotate the element (simplified implementation)
          if (selectedElementType === 'wall') {
            const center = new THREE.Vector3(
              (initialElementState.current.start.x + initialElementState.current.end.x) / 2,
              0,
              (initialElementState.current.start.z + initialElementState.current.end.z) / 2
            );

            const angle = deltaX * 0.01;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const start = new THREE.Vector3(
              initialElementState.current.start.x - center.x,
              0,
              initialElementState.current.start.z - center.z
            );

            const end = new THREE.Vector3(
              initialElementState.current.end.x - center.x,
              0,
              initialElementState.current.end.z - center.z
            );

            const rotatedStart = new THREE.Vector3(
              start.x * cos - start.z * sin,
              0,
              start.x * sin + start.z * cos
            );

            const rotatedEnd = new THREE.Vector3(
              end.x * cos - end.z * sin,
              0,
              end.x * sin + end.z * cos
            );

            updateWall(selectedElementId!, {
              start: {
                x: rotatedStart.x + center.x,
                y: initialElementState.current.start.y,
                z: rotatedStart.z + center.z,
              },
              end: {
                x: rotatedEnd.x + center.x,
                y: initialElementState.current.end.y,
                z: rotatedEnd.z + center.z,
              },
            });
          }
          break;

        case 'scale':
          // Scale the element (simplified implementation)
          const scale = 1 + deltaY * 0.01;

          if (selectedElementType === 'wall') {
            const length = Math.sqrt(
              Math.pow(initialElementState.current.end.x - initialElementState.current.start.x, 2) +
                Math.pow(initialElementState.current.end.z - initialElementState.current.start.z, 2)
            );

            const direction = new THREE.Vector3(
              (initialElementState.current.end.x - initialElementState.current.start.x) / length,
              0,
              (initialElementState.current.end.z - initialElementState.current.start.z) / length
            );

            const newLength = length * scale;
            const center = new THREE.Vector3(
              (initialElementState.current.start.x + initialElementState.current.end.x) / 2,
              0,
              (initialElementState.current.start.z + initialElementState.current.end.z) / 2
            );

            updateWall(selectedElementId!, {
              start: {
                x: center.x - (direction.x * newLength) / 2,
                y: initialElementState.current.start.y,
                z: center.z - (direction.z * newLength) / 2,
              },
              end: {
                x: center.x + (direction.x * newLength) / 2,
                y: initialElementState.current.end.y,
                z: center.z + (direction.z * newLength) / 2,
              },
            });
          }
          break;
      }
    },
    [
      isDragging,
      dragStart,
      manipulationMode,
      selectedElementType,
      selectedElementId,
      updateWall,
      updateStair,
    ]
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
              updateWall(selectedElementId, initialElementState.current);
              break;
            case 'door':
              updateDoor(selectedElementId, initialElementState.current);
              break;
            case 'window':
              updateWindow(selectedElementId, initialElementState.current);
              break;
            case 'stair':
              updateStair(selectedElementId, initialElementState.current);
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
      const wall = selectedElement.current;
      gizmoPosition = new THREE.Vector3(
        (wall.start.x + wall.end.x) / 2,
        wall.height / 2,
        (wall.start.z + wall.end.z) / 2
      );
      break;
    }
    case 'door': {
      const door = selectedElement.current;
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
      const windowElement = selectedElement.current;
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
      const stair = selectedElement.current;
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
