import { useElementContextMenu } from '@/components/UI/ContextMenu';
import { useMaterial3D } from '@/hooks/3d/useMaterial3D';
import { useDesignStore } from '@/stores/designStore';
import { useToolStore } from '@/stores/toolStore';
import { GeometryGenerator } from '@/utils/3d/geometry3D';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
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
  const hoveredWallId = useToolStore(state => state.hoveredWallId);

  const materialProps = useMaterial3D(wall?.materialId);
  const { show } = useElementContextMenu();
  const [isHovered, setIsHovered] = useState(false);

  const { geometry, position, rotation } = useMemo(() => {
    if (!wall)
      return { geometry: null, position: new THREE.Vector3(), rotation: new THREE.Euler() };

    const newGeometry = GeometryGenerator.createWallGeometry(wall, connectedWalls);

    const start = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
    const end = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);

    const newPosition = new THREE.Vector3(
      (start.x + end.x) / 2,
      wall.height / 2,
      (start.z + end.z) / 2
    );

    const newRotation = new THREE.Euler(0, -Math.atan2(end.z - start.z, end.x - start.x), 0);

    return { geometry: newGeometry, position: newPosition, rotation: newRotation };
  }, [wall, connectedWalls]);

  // Clean up geometry on unmount or when it changes
  useEffect(() => {
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [geometry]);

  // If wall doesn't exist, don't render
  if (!wall) return null;

  // Handle wall selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(wallId, 'wall');
  };

  const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    show({ event: e, props: { id: wallId, type: 'wall' } });
  };

  // Check if wall is selected
  const isSelected = selectedElementId === wallId;
  const isToolHovered = hoveredWallId === wallId;

  return (
    <group 
      position={position} 
      rotation={rotation} 
      onClick={handleSelect} 
      onContextMenu={handleContextMenu}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      userData={{ type: 'wall', id: wallId }}
    >
      {/* Wall mesh */}
      {geometry && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            {...materialProps}
            color={isSelected ? '#3b82f6' : isToolHovered ? '#93c5fd' : isHovered ? '#dbeafe' : materialProps.color || '#cccccc'}
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
