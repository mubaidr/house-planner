import type { Door, Wall, Window } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';
import { useMemo } from 'react';
import * as THREE from 'three';

export function MeasurementTool3D() {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);

  const selectedElement = useMemo(() => {
    if (!selectedElementId || !selectedElementType) return null;

    switch (selectedElementType) {
      case 'wall':
        return walls.find(w => w.id === selectedElementId);
      case 'door':
        return doors.find(d => d.id === selectedElementId);
      case 'window':
        return windows.find(w => w.id === selectedElementId);
      default:
        return null;
    }
  }, [selectedElementId, selectedElementType, walls, doors, windows]);

  // If no element is selected, don't render
  if (!selectedElement || !selectedElementType) return null;

  switch (selectedElementType) {
    case 'wall': {
      const wall = selectedElement as Wall;

      // Calculate midpoint for measurement display
      const midpoint = new THREE.Vector3(
        (wall.start.x + wall.end.x) / 2,
        wall.height + 0.5, // Slightly above the wall
        (wall.start.z + wall.end.z) / 2
      );

      // Calculate wall angle for text orientation
      const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

      return (
        <group>
          {/* Measurement line */}
          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array([
                    wall.start.x,
                    wall.height + 0.1,
                    wall.start.z,
                    wall.end.x,
                    wall.height + 0.1,
                    wall.end.z,
                  ])
                }
                count={2}
                itemSize={3}
                args={[
                  new Float32Array([
                    wall.start.x,
                    wall.height + 0.1,
                    wall.start.z,
                    wall.end.x,
                    wall.height + 0.1,
                    wall.end.z,
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="yellow" linewidth={2} />
          </line>

          {/* Measurement text */}
          <mesh position={midpoint} rotation={[0, wallAngle, 0]}>
            <boxGeometry args={[1, 0.1, 0.1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </group>
      );
    }

    case 'door': {
      const door = selectedElement as Door;
      const doorWall = walls.find(w => w.id === door.wallId);

      if (!doorWall) return null;

      // Calculate door position on wall
      const wallLength = Math.sqrt(
        Math.pow(doorWall.end.x - doorWall.start.x, 2) +
          Math.pow(doorWall.end.z - doorWall.start.z, 2)
      );

      const positionRatio = door.position / 100;
      const wallAngle = Math.atan2(
        doorWall.end.z - doorWall.start.z,
        doorWall.end.x - doorWall.start.x
      );

      const doorPosition = new THREE.Vector3(
        doorWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
        door.height / 2,
        doorWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
      );

      return (
        <group>
          {/* Door dimensions */}
          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array([
                    doorPosition.x - door.width / 2,
                    doorPosition.y + door.height / 2 + 0.1,
                    doorPosition.z,
                    doorPosition.x + door.width / 2,
                    doorPosition.y + door.height / 2 + 0.1,
                    doorPosition.z,
                  ])
                }
                count={2}
                itemSize={3}
                args={[
                  new Float32Array([
                    doorPosition.x - door.width / 2,
                    doorPosition.y + door.height / 2 + 0.1,
                    doorPosition.z,
                    doorPosition.x + door.width / 2,
                    doorPosition.y + door.height / 2 + 0.1,
                    doorPosition.z,
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="yellow" linewidth={2} />
          </line>

          {/* Width label */}
          <mesh position={[doorPosition.x, doorPosition.y + door.height / 2 + 0.2, doorPosition.z]}>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </group>
      );
    }

    case 'window': {
      const windowElement = selectedElement as Window;
      const windowWall = walls.find(w => w.id === windowElement.wallId);

      if (!windowWall) return null;

      // Calculate window position on wall
      const wallLength = Math.sqrt(
        Math.pow(windowWall.end.x - windowWall.start.x, 2) +
          Math.pow(windowWall.end.z - windowWall.start.z, 2)
      );

      const positionRatio = windowElement.position / 100;
      const wallAngle = Math.atan2(
        windowWall.end.z - windowWall.start.z,
        windowWall.end.x - windowWall.start.x
      );

      const windowPosition = new THREE.Vector3(
        windowWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
        windowElement.height / 2,
        windowWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
      );

      return (
        <group>
          {/* Window dimensions */}
          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array([
                    windowPosition.x - windowElement.width / 2,
                    windowPosition.y + windowElement.height / 2 + 0.1,
                    windowPosition.z,
                    windowPosition.x + windowElement.width / 2,
                    windowPosition.y + windowElement.height / 2 + 0.1,
                    windowPosition.z,
                  ])
                }
                count={2}
                itemSize={3}
                args={[
                  new Float32Array([
                    windowPosition.x - windowElement.width / 2,
                    windowPosition.y + windowElement.height / 2 + 0.1,
                    windowPosition.z,
                    windowPosition.x + windowElement.width / 2,
                    windowPosition.y + windowElement.height / 2 + 0.1,
                    windowPosition.z,
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="yellow" linewidth={2} />
          </line>

          {/* Width label */}
          <mesh
            position={[
              windowPosition.x,
              windowPosition.y + windowElement.height / 2 + 0.2,
              windowPosition.z,
            ]}
          >
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </group>
      );
    }

    default:
      return null;
  }
}
