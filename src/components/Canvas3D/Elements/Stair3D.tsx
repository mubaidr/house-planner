import { useElementContextMenu } from '@/components/UI/ContextMenu';
import { useDesignStore } from '@/stores/designStore';
import { useToolStore } from '@/stores/toolStore';
import { generateStraightStairs } from '@/utils/3d/geometry3D';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface Stair3DProps {
  stairId: string;
}

export function Stair3D({ stairId }: Stair3DProps) {
  const stair = useDesignStore(state => state.stairs.find(s => s.id === stairId));
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);
  const { show } = useElementContextMenu();
  const [isHovered, setIsHovered] = useState(false);
  const setHoveredElement = useToolStore(state => state.setHoveredElement);

  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);

  // Clean up geometries on unmount
  useEffect(() => {
    const geometries = geometriesRef.current;
    return () => {
      geometries.forEach(geometry => {
        geometry.dispose();
      });
    };
  }, []);

  // Calculate stair position and rotation
  const stairPosition = useMemo(() => {
    if (!stair) return new THREE.Vector3();
    return new THREE.Vector3(stair.start.x, stair.start.y, stair.start.z);
  }, [stair]);

  const stairRotation = useMemo(() => {
    if (!stair) return new THREE.Euler();
    const angle = Math.atan2(stair.end.z - stair.start.z, stair.end.x - stair.start.x);
    return new THREE.Euler(0, angle, 0);
  }, [stair]);

  // Create individual steps using generators
  const steps = useMemo(() => {
    if (!stair) return { geometries: [], positions: [], rotations: [] };

    const stepTransforms = generateStraightStairs(
      stair.steps,
      stair.stepDepth,
      stair.stepHeight,
      stair.width
    );

    const geometries: THREE.BufferGeometry[] = [];
    const positions: THREE.Vector3[] = [];
    const rotations: THREE.Euler[] = [];

    stepTransforms.forEach(transform => {
      // Create step geometry (simple box)
      const stepGeometry = new THREE.BoxGeometry(stair.width, stair.stepHeight, stair.stepDepth);
      geometries.push(stepGeometry);
      geometriesRef.current.push(stepGeometry);

      positions.push(
        new THREE.Vector3(transform.position.x, transform.position.y, transform.position.z)
      );
      rotations.push(new THREE.Euler(0, transform.rotationY, 0));
    });

    return { geometries, positions, rotations };
  }, [stair]);

  // Create railing if specified
  const railing = useMemo(() => {
    if (!stair || !stair.hasHandrail) return null;

    const stairLength = Math.sqrt(
      Math.pow(stair.end.x - stair.start.x, 2) + Math.pow(stair.end.z - stair.start.z, 2)
    );

    const railingGeometry = new THREE.CylinderGeometry(0.02, 0.02, stairLength);
    const railingMaterial = new THREE.MeshStandardMaterial({ color: '#C0C0C0' });

    return { geometry: railingGeometry, material: railingMaterial };
  }, [stair]);

  // If stair doesn't exist, don't render
  if (!stair) return null;

  // Handle stair selection
  const handleSelect = (e: any) => {
    e.stopPropagation();
    selectElement(stairId, 'stair');
  };

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    show({ event: e, props: { id: stairId, type: 'stair' } });
  };

  const isSelected = selectedElementId === stairId;

  return (
    <group
      position={stairPosition}
      rotation={stairRotation}
      onClick={handleSelect}
      onContextMenu={handleContextMenu}
      onPointerOver={() => {
        setIsHovered(true);
        setHoveredElement(stairId, 'stair');
      }}
      onPointerOut={() => {
        setIsHovered(false);
        setHoveredElement(null, null);
      }}
    >
      {/* Individual steps */}
      {steps.geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          position={steps.positions[index]}
          rotation={steps.rotations[index]}
        >
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : isHovered ? '#ca8a04' : '#8B4513'}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Railing */}
      {railing && (
        <mesh
          geometry={railing.geometry}
          material={railing.material}
          position={[stair.width / 2, stair.railingHeight || 0.9, 0]}
          rotation={[0, 0, Math.PI / 2]}
        />
      )}

      {/* Selection highlight */}
      {isSelected && (
        <group>
          {steps.geometries.map((geometry, index) => (
            <mesh
              key={`highlight-${index}`}
              geometry={geometry}
              position={steps.positions[index]}
              rotation={steps.rotations[index]}
            >
              <meshBasicMaterial
                color="#3b82f6"
                wireframe={true}
                transparent={true}
                opacity={0.5}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
