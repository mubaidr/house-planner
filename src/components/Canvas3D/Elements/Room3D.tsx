import { useDesignStore } from '@/stores/designStore';
import { Room } from '@/types';
import * as THREE from 'three';
import { useMemo } from 'react';

interface Room3DProps {
  room: Room;
  onSelect?: () => void;
}

export function Room3D({ room, onSelect }: Room3DProps) {
  const { selection, materials } = useDesignStore();
  const isSelected = selection.selectedElementId === room.id;

  // Create floor geometry from room points
  const floorGeometry = useMemo(() => {
    if (room.points.length < 3) return null;

    const shape = new THREE.Shape();
    shape.moveTo(room.points[0].x, room.points[0].y);

    for (let i = 1; i < room.points.length; i++) {
      shape.lineTo(room.points[i].x, room.points[i].y);
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    // Rotate to lie flat on XZ plane
    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }, [room.points]);

  // Get material
  const floorMaterial = materials.find(m => m.id === room.floorMaterialId) ||
                       materials.find(m => m.id === 'floor-wood') ||
                       materials[0];

  if (!floorGeometry) return null;

  const elevation = room.properties3D?.floorElevation || 0;

  return (
    <group>
      {/* Floor */}
      <mesh
        geometry={floorGeometry}
        position={[0, elevation, 0]}
        onClick={onSelect}
        onPointerOver={() => useDesignStore.getState().hoverElement(room.id, 'room')}
        onPointerOut={() => useDesignStore.getState().hoverElement(null, null)}
        receiveShadow
      >
        <meshStandardMaterial
          color={floorMaterial?.color || '#8b5a2b'}
          roughness={floorMaterial?.properties.roughness || 0.7}
          metalness={floorMaterial?.properties.metalness || 0.0}
        />
      </mesh>

      {/* Ceiling (if room has height) */}
      {room.ceilingHeight && (
        <mesh
          geometry={floorGeometry}
          position={[0, elevation + room.ceilingHeight, 0]}
          receiveShadow
        >
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh
          geometry={floorGeometry}
          position={[0, elevation + 0.01, 0]}
        >
          <meshBasicMaterial
            color="#3b82f6"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}
