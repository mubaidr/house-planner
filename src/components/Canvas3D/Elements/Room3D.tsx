import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDesignStore } from '@/stores/designStore';

interface Room3DProps {
  roomId: string;
}

export function Room3D({ roomId }: Room3DProps) {
  const room = useDesignStore(state => state.rooms.find(r => r.id === roomId));
  const walls = useDesignStore(state => state.walls);
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
  
  // If room doesn't exist, don't render
  if (!room) return null;
  
  // Get room walls
  const roomWalls = useMemo(() => {
    return room.wallIds
      .map(id => walls.find(w => w.id === id))
      .filter((wall): wall is NonNullable<typeof wall> => wall !== undefined);
  }, [room, walls]);
  
  // Calculate room floor geometry
  const floorGeometry = useMemo(() => {
    if (roomWalls.length === 0) return null;
    
    // For simplicity, we'll create a basic rectangle if we have 4 walls
    if (roomWalls.length === 4) {
      // Find min/max coordinates
      let minX = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxZ = -Infinity;
      
      roomWalls.forEach(wall => {
        minX = Math.min(minX, wall.start.x, wall.end.x);
        minZ = Math.min(minZ, wall.start.z, wall.end.z);
        maxX = Math.max(maxX, wall.start.x, wall.end.x);
        maxZ = Math.max(maxZ, wall.start.z, wall.end.z);
      });
      
      // Create shape
      const shape = new THREE.Shape();
      shape.moveTo(minX, minZ);
      shape.lineTo(maxX, minZ);
      shape.lineTo(maxX, maxZ);
      shape.lineTo(minX, maxZ);
      shape.closePath();
      
      const geometry = new THREE.ShapeGeometry(shape);
      
      // Store for cleanup
      geometryRef.current = geometry;
      
      return geometry;
    }
    
    return null;
  }, [roomWalls]);
  
  // Handle room selection
  const handleSelect = (e: THREE.Event) => {
    (e as any).nativeEvent?.stopPropagation();
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
            color={isSelected ? "#3b82f6" : "#DEB887"} 
            roughness={0.6}
            metalness={0.1}
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
          <meshBasicMaterial 
            color="#3b82f6" 
            wireframe={true} 
            transparent={true} 
            opacity={0.5} 
          />
        </mesh>
      )}
    </group>
  );
}