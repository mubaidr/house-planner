import React, { useMemo } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { Wall } from '@/types';
import { calculateWallGeometry, getMaterialProperties } from '@/utils/3d/geometryUtils';

interface Wall3DProps {
  wall: Wall;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const Wall3D: React.FC<Wall3DProps> = ({ wall, isSelected = false, onSelect }) => {
  const { materials, walls, selection } = useDesignStore();
  const isHovered = selection?.hoveredElementId === wall.id;

  // Enhanced wall geometry calculation using Phase 2 utilities
  const { geometry, position, rotation } = useMemo(() =>
    calculateWallGeometry(wall), [wall]
  );  // Enhanced material properties
  const materialProps = useMemo(() =>
    getMaterialProperties(wall.materialId, materials, '#f3f4f6'),
    [wall.materialId, materials]
  );

  // Calculate wall connections for enhanced rendering
  const connections = useMemo(() => {
    const connectedWalls = walls.filter(w =>
      w.id !== wall.id && (
        (Math.abs(w.startX - wall.startX) < 0.01 && Math.abs(w.startY - wall.startY) < 0.01) ||
        (Math.abs(w.endX - wall.startX) < 0.01 && Math.abs(w.endY - wall.startY) < 0.01) ||
        (Math.abs(w.startX - wall.endX) < 0.01 && Math.abs(w.startY - wall.endY) < 0.01) ||
        (Math.abs(w.endX - wall.endX) < 0.01 && Math.abs(w.endY - wall.endY) < 0.01)
      )
    );
    return connectedWalls.length;
  }, [wall, walls]);

  // Dynamic material color based on state
  const materialColor = isSelected
    ? '#3b82f6'
    : isHovered
      ? '#60a5fa'
      : wall.color || materialProps.color;

  // Enhanced material properties with Phase 2 specifications
  const enhancedMaterial = useMemo(() => {
    const baseProperties = {
      color: materialColor,
      roughness: materialProps.roughness,
      metalness: materialProps.metalness,
      transparent: materialProps.opacity < 1 || isSelected,
      opacity: isSelected ? 0.8 : materialProps.opacity,
    };

    // Add texture scaling if specified
    if (wall.properties3D?.textureScale) {
      // Note: Texture implementation would go here
      // For now, we adjust the material properties
      return {
        ...baseProperties,
        roughness: baseProperties.roughness * wall.properties3D.textureScale,
      };
    }

    return baseProperties;
  }, [materialColor, materialProps, isSelected, wall.properties3D]);

  return (
    <group name={`wall-${wall.id}`}>
      <mesh
        geometry={geometry}
        position={position}
        rotation={rotation}
        onClick={onSelect}
        onPointerOver={() => useDesignStore.getState().hoverElement(wall.id, 'wall')}
        onPointerOut={() => useDesignStore.getState().hoverElement(null, null)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...enhancedMaterial} />
      </mesh>

      {/* Enhanced selection visualization */}
      {isSelected && (
        <mesh geometry={geometry} position={position} rotation={rotation}>
          <meshBasicMaterial
            color="#3b82f6"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* Wall connection indicators for debugging (Phase 2 feature) */}
      {isSelected && connections > 0 && (
        <mesh position={[position[0], position[1] + wall.height / 2 + 0.2, position[2]]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Wall length label for selected walls (Phase 2 feature) */}
      {isSelected && (
        <group position={[position[0], position[1] + wall.height / 2 + 0.5, position[2]]}>
          {/* Note: Text component would be imported from @react-three/drei for actual text rendering */}
          <mesh>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}
