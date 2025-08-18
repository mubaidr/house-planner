import { useMemo } from 'react';
import * as THREE from 'three';
import { useDesignStore } from '@/stores/designStore';

interface Roof3DProps {
  roofId: string;
}

export function Roof3D({ roofId }: Roof3DProps) {
  // For now, we'll use a placeholder since roofs aren't in the store yet
  // In a full implementation, we would get the roof from the store like:
  // const roof = useDesignStore(state => state.roofs.find(r => r.id === roofId));
  
  // Placeholder roof data
  const roof = {
    id: roofId,
    // In a full implementation, this would be based on the walls/rooms
    points: [
      { x: -5, y: 5, z: -5 },
      { x: 5, y: 5, z: -5 },
      { x: 5, y: 5, z: 5 },
      { x: -5, y: 5, z: 5 }
    ],
    type: 'flat' as const
  };
  
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);
  
  // If roof doesn't exist, don't render
  if (!roof) return null;
  
  // Calculate roof geometry
  const roofGeometry = useMemo(() => {
    if (roof.points.length < 3) return null;
    
    // Create shape from roof points
    const shape = new THREE.Shape();
    shape.moveTo(roof.points[0].x, roof.points[0].z);
    
    for (let i = 1; i < roof.points.length; i++) {
      shape.lineTo(roof.points[i].x, roof.points[i].z);
    }
    
    shape.closePath();
    
    // For a flat roof, we can use ShapeGeometry
    if (roof.type === 'flat') {
      const geometry = new THREE.ShapeGeometry(shape);
      return geometry;
    }
    
    // For other roof types, we would create more complex geometry
    // This is a simplified version for now
    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }, [roof]);
  
  // Handle roof selection
  const handleSelect = (e: THREE.Event) => {
    (e as any).nativeEvent?.stopPropagation();
    // In a full implementation: selectElement(roofId, 'roof');
  };
  
  // Check if roof is selected
  const isSelected = selectedElementId === roofId;
  
  return (
    <group onClick={handleSelect}>
      {/* Roof */}
      {roofGeometry && (
        <mesh 
          geometry={roofGeometry}
          position={[0, 5, 0]} // Position at roof height
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshStandardMaterial 
            color={isSelected ? "#3b82f6" : "#8B4513"} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}
      
      {/* Selection highlight */}
      {isSelected && roofGeometry && (
        <mesh 
          geometry={roofGeometry}
          position={[0, 5.01, 0]} // Slightly above roof
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