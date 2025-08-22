import { useMaterial3D } from '@/hooks/3d/useMaterial3D';
import { useDesignStore, Wall } from '@/stores/designStore';
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
    if (roomWalls.length < 3) return null;

    // Wall tracing algorithm to order the vertices
    const orderedWalls: Wall[] = [];
    let currentWall = roomWalls[0];
    const remainingWalls = [...roomWalls.slice(1)];

    orderedWalls.push(currentWall);

    while (remainingWalls.length > 0) {
      const currentEndpoint = currentWall.end;
      let foundNext = false;
      for (let i = 0; i < remainingWalls.length; i++) {
        const nextWall = remainingWalls[i];
        if (nextWall.start.x === currentEndpoint.x && nextWall.start.z === currentEndpoint.z) {
          orderedWalls.push(nextWall);
          currentWall = nextWall;
          remainingWalls.splice(i, 1);
          foundNext = true;
          break;
        } else if (nextWall.end.x === currentEndpoint.x && nextWall.end.z === currentEndpoint.z) {
          // Reverse the wall direction and add it
          const reversedWall = { ...nextWall, start: nextWall.end, end: nextWall.start };
          orderedWalls.push(reversedWall);
          currentWall = reversedWall;
          remainingWalls.splice(i, 1);
          foundNext = true;
          break;
        }
      }
      if (!foundNext) {
        // Could not find a closed loop, return null
        return null;
      }
    }

    const points = orderedWalls.map(w => new THREE.Vector2(w.start.x, w.start.z));
    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);
    geometryRef.current = geometry;

    return geometry;
  }, [roomWalls]);

  const ceilingGeometry = useMemo(() => {
    if (!floorGeometry) return null;
    return floorGeometry.clone();
  }, [floorGeometry]);

  // If room doesn't exist, don't render
  if (!room) return null;

  // Handle room selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(roomId, 'room');
  };

  // Check if room is selected
  const isSelected = selectedElementId === roomId;

  const roomHeight = roomWalls.length > 0 ? roomWalls[0].height : 0;

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
