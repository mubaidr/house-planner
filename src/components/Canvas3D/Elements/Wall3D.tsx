import { useMaterial3D } from '@/hooks/3d/useMaterial3D';
import { useDesignStore } from '@/stores/designStore';
import { GeometryGenerator } from '@/utils/3d/geometry3D';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Wall3DProps {
  wallId: string;
}

export function Wall3D({ wallId }: Wall3DProps) {
  const { wall, connectedWalls, selectedElementId, selectElement } = useDesignStore(state => ({
    wall: state.walls.find(w => w.id === wallId),
    connectedWalls: state.getConnectedWalls(wallId),
    selectedElementId: state.selectedElementId,
    selectElement: state.selectElement,
  }));

  const materialProps = useMaterial3D(wall?.materialId);

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  const { geometry, position, rotation } = useMemo(() => {
    if (!wall)
      return { geometry: null, position: new THREE.Vector3(), rotation: new THREE.Euler() };

    // Clean up previous geometry if it exists
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }

    const geometry = GeometryGenerator.createWallGeometry(wall, connectedWalls);
    geometryRef.current = geometry;

    const start = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
    const end = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);

    const position = new THREE.Vector3(
      (start.x + end.x) / 2,
      wall.height / 2,
      (start.z + end.z) / 2
    );

    const rotation = new THREE.Euler(0, -Math.atan2(end.z - start.z, end.x - start.x), 0);

    return { geometry, position, rotation };
  }, [wall, connectedWalls]);

  // Clean up geometry on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
        geometryRef.current = null;
      }
    };
  }, []);

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
    <group position={position} rotation={rotation} onClick={handleSelect}>
      {/* Wall mesh */}
      {geometry && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            {...materialProps}
            color={isSelected ? '#3b82f6' : materialProps.color || '#cccccc'}
          />
        </mesh>
      )}

      {/* Selection highlight */}
      {isSelected && geometry && (
        <mesh geometry={geometry}>
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
