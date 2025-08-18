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
  
  // Calculate room floor geometry using actual wall connections
  const floorGeometry = useMemo(() => {
    if (roomWalls.length === 0) return null;
    
    // Create points array for the floor shape by connecting walls
    const points: THREE.Vector2[] = [];
    
    // For connected walls, we need to trace the perimeter
    // For now, we'll create a simplified approach that works for rectangular rooms
    if (roomWalls.length >= 3) {
      // Collect all unique corner points
      const corners: THREE.Vector2[] = [];
      
      roomWalls.forEach(wall => {
        // Add start and end points
        corners.push(new THREE.Vector2(wall.start.x, wall.start.z));
        corners.push(new THREE.Vector2(wall.end.x, wall.end.z));
      });
      
      // Remove duplicate points (with small tolerance)
      const uniqueCorners: THREE.Vector2[] = [];
      const tolerance = 0.001;
      
      corners.forEach(corner => {
        const isDuplicate = uniqueCorners.some(existing => 
          Math.abs(existing.x - corner.x) < tolerance && 
          Math.abs(existing.y - corner.z) < tolerance
        );
        
        if (!isDuplicate) {
          uniqueCorners.push(corner);
        }
      });
      
      // Sort points to form a proper polygon (simplified approach)
      if (uniqueCorners.length >= 3) {
        // Find centroid
        let cx = 0, cz = 0;
        uniqueCorners.forEach(p => {
          cx += p.x;
          cz += p.y;
        });
        cx /= uniqueCorners.length;
        cz /= uniqueCorners.length;
        
        // Sort points by angle from centroid
        uniqueCorners.sort((a, b) => {
          const angleA = Math.atan2(a.y - cz, a.x - cx);
          const angleB = Math.atan2(b.y - cz, b.x - cx);
          return angleA - angleB;
        });
        
        // Create shape
        const shape = new THREE.Shape();
        shape.moveTo(uniqueCorners[0].x, uniqueCorners[0].y);
        
        for (let i = 1; i < uniqueCorners.length; i++) {
          shape.lineTo(uniqueCorners[i].x, uniqueCorners[i].y);
        }
        
        shape.closePath();
        
        const geometry = new THREE.ShapeGeometry(shape);
        
        // Store for cleanup
        geometryRef.current = geometry;
        
        return geometry;
      }
    }
    
    // Fallback to rectangle for 4 walls
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