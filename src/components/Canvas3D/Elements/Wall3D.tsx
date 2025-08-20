import { useDesignStore } from '@/stores/designStore';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Wall3DProps {
  wallId: string;
}

export function Wall3D({ wallId }: Wall3DProps) {
  const wall = useDesignStore(state => state.walls.find(w => w.id === wallId));
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Clean up geometry on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
    };
  }, []);

  // Calculate wall geometry
  const wallGeometry = useMemo(() => {
    if (!wall) return null;
    // Calculate wall length
    const length = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
    );

    // Create geometry
    const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);

    // Center the geometry at origin for easier positioning
    geometry.translate(0, 0, 0); // Already centered by default

    // Store for cleanup
    geometryRef.current = geometry;

    return geometry;
  }, [wall]);

  // Calculate wall position
  const wallPosition = useMemo(() => {
    if (!wall) return new THREE.Vector3();
    // Position at the center of the wall
    return new THREE.Vector3(
      (wall.start.x + wall.end.x) / 2,
      wall.height / 2,
      (wall.start.z + wall.end.z) / 2
    );
  }, [wall]);

  // Calculate wall rotation
  const wallRotation = useMemo(() => {
    if (!wall) return new THREE.Euler();
    const angle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    return new THREE.Euler(0, angle, 0);
  }, [wall]);

  // If wall doesn't exist, don't render
  if (!wall) return null;

  // Handle wall selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(wallId, 'wall');
  };

  // Check if wall is selected
  const isSelected = selectedElementId === wallId;

  return (
    <group position={wallPosition} rotation={wallRotation} onClick={handleSelect}>
      {/* Wall mesh */}
      {wallGeometry && (
        <mesh geometry={wallGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : '#cccccc'}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Selection highlight */}
      {isSelected && wallGeometry && (
        <mesh geometry={wallGeometry}>
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
