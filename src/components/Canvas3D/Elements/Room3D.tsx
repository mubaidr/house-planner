import { useMaterial3D } from '@/hooks/3d/useMaterial3D';
import { useDesignStore } from '@/stores/designStore';
import { GeometryGenerator } from '@/utils/3d/geometry3D';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Room3DProps {
  roomId: string;
}

export function Room3D({ roomId }: Room3DProps) {
  const room = useDesignStore(state => state.rooms.find(r => r.id === roomId));
  const walls = useDesignStore(state => state.walls);
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);

  const floorMaterialProps = useMaterial3D(room?.floorMaterialId);
  const ceilingMaterialProps = useMaterial3D(room?.ceilingMaterialId);

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Clean up geometry on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
    };
  }, []);

  // Get room walls
  const roomWalls = useMemo(() => {
    if (!room) return [];
    return room.wallIds
      .map(id => walls.find(w => w.id === id))
      .filter((wall): wall is NonNullable<typeof wall> => wall !== undefined);
  }, [room, walls]);

  const floorGeometry = useMemo(() => {
    const geometry = GeometryGenerator.createRoomFloorGeometry(roomWalls);
    geometryRef.current = geometry;
    return geometry;
  }, [roomWalls]);

  const ceilingGeometry = useMemo(() => {
    const geometry = GeometryGenerator.createRoomCeilingGeometry(roomWalls);
    return geometry;
  }, [roomWalls]);

  const roomHeight = useMemo(() => {
    if (roomWalls.length === 0) return 0;
    return roomWalls.reduce((acc, wall) => acc + wall.height, 0) / roomWalls.length;
  }, [roomWalls]);

  // If room doesn't exist, don't render
  if (!room) return null;

  // Handle room selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(roomId, 'room');
  };

  // Check if room is selected
  const isSelected = selectedElementId === roomId;

  return (
    <group onClick={handleSelect}>
      {/* Room floor */}
      {floorGeometry && (
        <mesh
          geometry={floorGeometry}
          position={[0, 0.01, 0]} // Slightly above ground to avoid z-fighting
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshStandardMaterial
            {...floorMaterialProps}
            color={isSelected ? '#3b82f6' : floorMaterialProps.color || '#DEB887'}
          />
        </mesh>
      )}

      {/* Room ceiling */}
      {ceilingGeometry && (
        <mesh
          geometry={ceilingGeometry}
          position={[0, roomHeight, 0]}
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshStandardMaterial
            {...ceilingMaterialProps}
            color={ceilingMaterialProps.color || '#F5F5F5'}
          />
        </mesh>
      )}

      {/* Selection highlight */}
      {isSelected && floorGeometry && (
        <mesh
          geometry={floorGeometry}
          position={[0, 0.02, 0]} // Slightly above floor
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
