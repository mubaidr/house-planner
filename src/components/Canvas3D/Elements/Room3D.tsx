import { useDesignStore } from '@/stores/designStore';
import { Room } from '@/types';
import { generateRoomGeometry, getMaterialProperties } from '@/utils/3d/geometryUtils';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Room3DProps {
  room: Room;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const Room3D: React.FC<Room3DProps> = ({ room, isSelected = false, onSelect }) => {
  const { materials } = useDesignStore();

  // Enhanced room geometry generation using Phase 2 utilities
  const { floorGeometry, ceilingGeometry, center } = useMemo(() => {
    try {
      return generateRoomGeometry(room);
    } catch (error) {
      console.warn(`Failed to generate geometry for room ${room.id}:`, error);
      // Return fallback simple geometry
      const fallbackShape = new THREE.Shape();
      fallbackShape.moveTo(0, 0);
      fallbackShape.lineTo(5, 0);
      fallbackShape.lineTo(5, 5);
      fallbackShape.lineTo(0, 5);
      fallbackShape.closePath();

      const fallbackGeometry = new THREE.ShapeGeometry(fallbackShape);
      fallbackGeometry.rotateX(-Math.PI / 2);

      return {
        floorGeometry: fallbackGeometry,
        ceilingGeometry: fallbackGeometry.clone(),
        center: { x: 2.5, y: 2.5 }
      };
    }
  }, [room]);

  // Enhanced material properties using Phase 2 utilities
  const floorMaterialProps = useMemo(() =>
    getMaterialProperties(room.floorMaterialId, materials, '#8b5a2b'),
    [room.floorMaterialId, materials]
  );

  const ceilingMaterialProps = useMemo(() =>
    getMaterialProperties(room.properties3D?.ceilingMaterialId, materials, '#ffffff'),
    [room.properties3D?.ceilingMaterialId, materials]
  );

  // Calculate room elevations
  const floorElevation = room.properties3D?.floorElevation || 0;
  const ceilingHeight = room.ceilingHeight || room.properties3D?.ceilingHeight || 3;

  // Enhanced floor material with Phase 2 properties
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: floorMaterialProps.color,
    roughness: floorMaterialProps.roughness,
    metalness: floorMaterialProps.metalness,
    transparent: floorMaterialProps.opacity < 1,
    opacity: floorMaterialProps.opacity,
  }), [floorMaterialProps]);

  // Enhanced ceiling material
  const ceilingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: ceilingMaterialProps.color,
    roughness: ceilingMaterialProps.roughness,
    metalness: ceilingMaterialProps.metalness,
    transparent: ceilingMaterialProps.opacity < 1,
    opacity: ceilingMaterialProps.opacity,
  }), [ceilingMaterialProps]);

  return (
    <group name={`room-${room.id}`}>
      {/* Enhanced Floor with Phase 2 features */}
      <mesh
        geometry={floorGeometry}
        material={floorMaterial}
        position={[0, floorElevation, 0]}
        onClick={onSelect}
        onPointerOver={() => useDesignStore.getState().hoverElement(room.id, 'room')}
        onPointerOut={() => useDesignStore.getState().hoverElement(null, null)}
        receiveShadow
      />

      {/* Enhanced Ceiling with proper height */}
      <mesh
        geometry={ceilingGeometry}
        material={ceilingMaterial}
        position={[0, floorElevation + ceilingHeight, 0]}
        receiveShadow
      />

      {/* Enhanced selection indicator */}
      {isSelected && (
        <mesh
          geometry={floorGeometry}
          position={[0, floorElevation + 0.01, 0]}
        >
          <meshBasicMaterial
            color="#3b82f6"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Phase 2: Room center indicator when selected */}
      {isSelected && (
        <mesh position={[center.x, floorElevation + 0.1, center.y]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Phase 2: Room label (placeholder for text component) */}
      {room.name && isSelected && (
        <mesh position={[center.x, floorElevation + 2, center.y]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}
