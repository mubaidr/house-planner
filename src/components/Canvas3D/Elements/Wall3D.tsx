import { useMemo } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { Wall } from '@/types';
import * as THREE from 'three';

interface Wall3DProps {
  wall: Wall;
  onSelect?: () => void;
}

export function Wall3D({ wall, onSelect }: Wall3DProps) {
  const { selection, materials } = useDesignStore();
  const isSelected = selection.selectedElementId === wall.id;
  const isHovered = selection.hoveredElementId === wall.id;

  // Calculate wall geometry
  const wallGeometry = useMemo(() => {
    const length = Math.sqrt(
      Math.pow(wall.endX - wall.startX, 2) +
      Math.pow(wall.endY - wall.startY, 2)
    );

    const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
    return geometry;
  }, [wall]);

  // Calculate wall position and rotation
  const { position, rotation } = useMemo(() => {
    const centerX = (wall.startX + wall.endX) / 2;
    const centerZ = (wall.startY + wall.endY) / 2;
    const centerY = wall.height / 2;

    const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);

    return {
      position: [centerX, centerY, centerZ] as [number, number, number],
      rotation: [0, angle, 0] as [number, number, number],
    };
  }, [wall]);

  // Get material properties
  const material = useMemo(() => {
    const wallMaterial = materials.find(m => m.id === wall.materialId) || materials[0];
    return wallMaterial;
  }, [wall.materialId, materials]);

  const materialColor = isSelected
    ? '#3b82f6'
    : isHovered
      ? '#60a5fa'
      : wall.color || material?.color || '#f3f4f6';

  return (
    <mesh
      geometry={wallGeometry}
      position={position}
      rotation={rotation}
      onClick={onSelect}
      onPointerOver={() => useDesignStore.getState().hoverElement(wall.id, 'wall')}
      onPointerOut={() => useDesignStore.getState().hoverElement(null, null)}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={materialColor}
        roughness={material?.properties.roughness || 0.8}
        metalness={material?.properties.metalness || 0.0}
        transparent={material?.properties.opacity !== undefined}
        opacity={material?.properties.opacity || 1.0}
      />

      {/* Selection outline */}
      {isSelected && (
        <mesh geometry={wallGeometry}>
          <meshBasicMaterial
            color="#3b82f6"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </mesh>
  );
}
