import { useDesignStore } from '@/stores/designStore';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Roof3DProps {
  roofId: string;
}

export function Roof3D({ roofId }: Roof3DProps) {
  const roof = useDesignStore(state => state.roofs?.find(r => r.id === roofId));
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
      geometryRef.current = geometry;
      return geometry;
    }

    // For other roof types, we would create more complex geometry
    // This is a simplified version for now
    const geometry = new THREE.ShapeGeometry(shape);
    geometryRef.current = geometry;
    return geometry;
  }, [roof]);

  // Handle roof selection
  const handleSelect = (e: THREE.Event) => {
    (e as any).nativeEvent?.stopPropagation();
    selectElement(roofId, 'roof');
  };

  // Check if roof is selected
  const isSelected = selectedElementId === roofId;

  // Calculate roof height from points
  const roofHeight = useMemo(() => {
    return roof.points.length > 0 ? roof.points[0].y : 0;
  }, [roof]);

  return (
    <group onClick={handleSelect}>
      {/* Roof */}
      {roofGeometry && (
        <mesh
          geometry={roofGeometry}
          position={[0, roofHeight, 0]} // Position at roof height
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : '#8B4513'}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Selection highlight */}
      {isSelected && roofGeometry && (
        <mesh
          geometry={roofGeometry}
          position={[0, roofHeight + 0.01, 0]} // Slightly above roof
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
