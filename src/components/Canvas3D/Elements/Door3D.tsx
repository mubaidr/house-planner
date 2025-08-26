import { useDesignStore } from '@/stores/designStore';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Door3DProps {
  doorId: string;
}

export function Door3D({ doorId }: Door3DProps) {
  const door = useDesignStore(state => state.doors.find(d => d.id === doorId));
  const wall = useDesignStore(state => state.walls.find(w => w.id === door?.wallId));
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);

  const groupRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Mesh>(null);

  // Calculate door position on wall
  const doorPosition = useMemo(() => {
    if (!door || !wall) return new THREE.Vector3(0, 0, 0);

    // Calculate wall length
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
    );

    // Calculate position ratio (convert from percentage to 0-1)
    const positionRatio = door.position / 100;

    // Calculate wall angle
    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    // Calculate door position
    const x = wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio;
    const z = wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio;

    // Height position (bottom of door)
    const y = 0;

    return new THREE.Vector3(x, y, z);
  }, [door, wall]);

  // Calculate door rotation based on wall angle
  const doorRotation = useMemo(() => {
    if (!wall) return new THREE.Euler(0, 0, 0);

    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    return new THREE.Euler(0, wallAngle, 0);
  }, [wall]);

  // Memoize the light creation
  const doorLight = useMemo(() => {
    if (!door?.isOpen) return null;

    const rect = new THREE.RectAreaLight('#FFFFFF', 2, door.width, door.height);
    rect.position.set(0, door.height / 2, 0.1);
    rect.rotation.set(0, Math.PI, 0);
    return rect;
  }, [door?.isOpen, door?.width, door?.height]);

  // Animate door opening based on type
  useFrame(() => {
    if (!door || !groupRef.current || !panelRef.current) return;

    switch (door.type) {
      case 'hinged': {
        // Rotate the entire door group for hinged doors
        // Determine rotation direction
        const direction =
          door.swingDirection === 'left' ? 1 : door.swingDirection === 'right' ? -1 : 1;

        // Apply rotation
        groupRef.current.rotation.y = THREE.MathUtils.degToRad(
          door.isOpen ? door.openAngle * direction : 0
        );
        break;
      }

      case 'sliding': {
        // Move the door panel horizontally for sliding doors
        // Calculate slide offset based on open state
        const maxOffset = door.width;
        const currentOffset = door.isOpen ? door.openOffset * maxOffset : 0;

        // Determine direction (left or right)
        const slideDirection = door.swingDirection === 'left' ? -1 : 1;

        panelRef.current.position.x = currentOffset * slideDirection;
        break;
      }

      default:
        // For other door types, no animation for now
        break;
    }
  });

  // If door or wall doesn't exist, don't render
  if (!door || !wall) return null;

  // Handle door selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(doorId, 'door');
  };

  // Check if door is selected
  const isSelected = selectedElementId === doorId;

  return (
    <group ref={groupRef} position={doorPosition} rotation={doorRotation} onClick={handleSelect}>
      {/* Door frame */}
      <mesh position={[0, door.height / 2 + 0.025, 0]}>
        <boxGeometry args={[door.width + 0.05, door.height + 0.05, door.thickness + 0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Door panel */}
      <mesh ref={panelRef} position={[0, door.height / 2, 0]}>
        <boxGeometry args={[door.width, door.height, door.thickness]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Door light */}
      {doorLight && <primitive object={doorLight} />}

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, door.height / 2, 0]}>
          <boxGeometry args={[door.width + 0.1, door.height + 0.1, door.thickness + 0.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
