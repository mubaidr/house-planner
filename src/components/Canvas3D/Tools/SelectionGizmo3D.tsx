import { useMemo } from 'react';
import type { Door, Wall, Window } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';
import { useGLTF } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useGesture } from '@use-gesture/react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useBoundStore, Scene3DState } from '../../../stores/scene3DStore';

export function SelectionGizmo3D() {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);

    const { selectedElement, elements } = useBoundStore(
    useCallback(
      (state: Scene3DState) => useMemo(() => ({
        selectedElement: state.selectedElement,
        elements: state.elements,
      }), [state.selectedElement, state.elements]),
      [],
    ),
  );

  // If no element is selected, don't render
  if (!selectedElement || !selectedElementType) return null;

  // Calculate position for the gizmo
  let position = new THREE.Vector3(0, 0, 0);

  switch (selectedElementType) {
    case 'wall': {
      const wall = selectedElement as Wall;
      position = new THREE.Vector3(
        (wall.start.x + wall.end.x) / 2,
        wall.height / 2,
        (wall.start.z + wall.end.z) / 2
      );
      break;
    }
    case 'door': {
      const door = selectedElement as Door;
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

        position = new THREE.Vector3(
          doorWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
          door.height / 2,
          doorWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
        );
      }
      break;
    }
    case 'window': {
      const windowElement = selectedElement as Window;
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

        position = new THREE.Vector3(
          windowWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
          windowElement.height / 2,
          windowWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
        );
      }
      break;
    }
  }

  return (
    <group position={position}>
      {/* X axis - red */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* Y axis - green */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshBasicMaterial color="green" />
      </mesh>

      {/* Z axis - blue */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[0.05, 0.05, 1]} />
        <meshBasicMaterial color="blue" />
      </mesh>

      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
}
