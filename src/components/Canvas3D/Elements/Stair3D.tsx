import { useDesignStore } from '@/stores/designStore';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { generateStraightStairs, generateLShapedStairs, generateUShapedStairs } from '@/utils/3d/geometry3D';

interface Stair3DProps {
  stairId: string;
}

export function Stair3D({ stairId }: Stair3DProps) {
  const stair = useDesignStore(state => state.stairs.find(s => s.id === stairId));
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);

  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);

  // Clean up geometries on unmount
  useEffect(() => {
    return () => {
      geometriesRef.current.forEach(geometry => {
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

    // Choose generator based on stair.type
    let transforms = generateStraightStairs(stair.steps, stair.stepDepth, stair.stepHeight, stair.width);
    if (stair.type === 'l-shaped') {
      transforms = generateLShapedStairs(stair.steps, stair.stepDepth, stair.stepHeight, stair.width);
    } else if (stair.type === 'u-shaped') {
      transforms = generateUShapedStairs(stair.steps, stair.stepDepth, stair.stepHeight, stair.width);
    }

    const stepGeometries: THREE.BufferGeometry[] = [];
    const stepPositions: THREE.Vector3[] = [];
    const stepRotations: number[] = [];

    transforms.forEach(t => {
      const geometry = new THREE.BoxGeometry(stair.stepDepth, stair.stepHeight, stair.width);
      stepGeometries.push(geometry);
      geometriesRef.current.push(geometry);
      stepPositions.push(new THREE.Vector3(t.position.x, t.position.y, t.position.z));
      stepRotations.push(t.rotationY);
    });

    return { geometries: stepGeometries, positions: stepPositions, rotations: stepRotations };
  }, [stair]);

  // Create railing if needed
  const railing = useMemo(() => {
    if (!stair || !stair.hasHandrail) return null;

    // Calculate stair length
    const length = Math.sqrt(
      Math.pow(stair.end.x - stair.start.x, 2) + Math.pow(stair.end.z - stair.start.z, 2)
    );

    // Create railing geometry
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8);

    // Position railing at the top of the stairs
    const height = stair.steps * stair.stepHeight + (stair.railingHeight || 0.9);
    const y = height;
    const z = stair.width / 2 - 0.05; // Position at the edge of the stairs

    return { geometry, position: new THREE.Vector3(0, y, z) };
  }, [stair]);

  // If stair doesn't exist, don't render
  if (!stair) return null;

  // Handle stair selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(stairId, 'stair');
  };

  // Check if stair is selected
  const isSelected = selectedElementId === stairId;

  return (
    <group position={stairPosition} rotation={stairRotation} onClick={handleSelect}>
      {/* Render individual steps */}
      {steps.geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          position={steps.positions[index]}
          rotation={[0, steps.rotations[index], 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : '#8B4513'}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Render railing if needed */}
      {railing && (
        <mesh geometry={railing.geometry} position={railing.position} castShadow receiveShadow>
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : '#A9A9A9'}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* Selection highlight - using a single box around all steps */}
      {isSelected && (
        <mesh>
          <boxGeometry
            args={[stair.stepDepth * stair.steps, stair.stepHeight * stair.steps, stair.width]}
          />
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
