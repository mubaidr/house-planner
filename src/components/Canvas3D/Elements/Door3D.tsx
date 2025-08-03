'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { useDesignStore } from '@/stores/designStore';
import { Door } from '@/types';
import {
  calculateDoorPositionOnWall,
  createDoorGeometries,
  getMaterialProperties
} from '@/utils/3d/geometryUtils';
import * as THREE from 'three';

interface Door3DProps {
  door: Door;
  isSelected: boolean;
  onClick?: () => void;
}

export const Door3D: React.FC<Door3DProps> = ({ door, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const doorPanelRef = useRef<THREE.Mesh>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const { walls, materials } = useDesignStore();

  // Find the wall this door belongs to
  const parentWall = useMemo(() =>
    walls.find(wall => wall.id === door.wallId),
    [walls, door.wallId]
  );

  // Calculate door position using Phase 2 utilities
  const { position, rotation } = useMemo(() => {
    if (parentWall) {
      return calculateDoorPositionOnWall(door, parentWall);
    }
    // Fallback to absolute position if no wall found
    if (typeof door.position === 'object') {
      return {
        position: [door.position.x, door.position.y, door.position.z] as [number, number, number],
        rotation: [0, door.rotation || 0, 0] as [number, number, number],
      };
    }
    return {
      position: [0, door.height / 2, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    };
  }, [door, parentWall]);

  // Enhanced door geometries using Phase 2 utilities
  const { frameGeometry, panelGeometry } = useMemo(() =>
    createDoorGeometries(door), [door]
  );

  // Calculate rotation for opening animation
  const { openRotation } = useSpring({
    openRotation: isOpen ? Math.PI / 2 : 0,
    config: { tension: 120, friction: 14 }
  });

  // Enhanced material properties
  const frameMaterialProps = useMemo(() =>
    getMaterialProperties(door.materialId, materials, '#8B4513'),
    [door.materialId, materials]
  );

  const panelMaterialProps = useMemo(() =>
    getMaterialProperties(door.materialId, materials, '#D2691E'),
    [door.materialId, materials]
  );

  // Handle geometry for Phase 2 enhanced door handles
  const handleGeometry = useMemo(() => {
    const handleStyle = door.properties3D?.handleStyle || 'classic';
    if (handleStyle === 'modern') {
      return new THREE.BoxGeometry(0.15, 0.05, 0.03);
    }
    return new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
  }, [door.properties3D?.handleStyle]);

  // Enhanced materials with Phase 2 properties
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: frameMaterialProps.color,
    roughness: frameMaterialProps.roughness,
    metalness: frameMaterialProps.metalness,
    transparent: frameMaterialProps.opacity < 1,
    opacity: frameMaterialProps.opacity,
  }), [frameMaterialProps]);

  const panelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: panelMaterialProps.color,
    roughness: panelMaterialProps.roughness * 0.9, // Slightly smoother than frame
    metalness: panelMaterialProps.metalness,
    transparent: panelMaterialProps.opacity < 1,
    opacity: panelMaterialProps.opacity,
  }), [panelMaterialProps]);

  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: door.properties3D?.handleStyle === 'modern' ? '#2C3E50' : '#FFD700',
    roughness: 0.3,
    metalness: 0.8
  }), [door.properties3D?.handleStyle]);

  // Enhanced selection outline effect
  useFrame(() => {
    if (groupRef.current) {
      if (isSelected) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(0x333333);
          }
        });
      } else {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(0x000000);
          }
        });
      }
    }
  });

  const handleDoorClick = (event: any) => {
    event?.stopPropagation?.();
    if (onClick) {
      onClick();
    } else {
      // Toggle door open/close if not in selection mode
      setIsOpen(!isOpen);
    }
  };

  const frameThickness = door.properties3D?.frameThickness || 0.1;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleDoorClick}
      name={`door-${door.id}`}
    >
      {/* Enhanced Door Frame with Phase 2 geometry */}
      <mesh
        geometry={frameGeometry}
        material={frameMaterial}
        castShadow
        receiveShadow
      />

      {/* Animated Door Panel with enhanced positioning */}
      <animated.group
        position={[door.width / 2 - frameThickness, door.height / 2 - frameThickness, 0]}
        rotation-y={openRotation}
      >
        <mesh
          ref={doorPanelRef}
          geometry={panelGeometry}
          material={panelMaterial}
          position={[-(door.width - frameThickness * 2) / 2, -(door.height - frameThickness * 2) / 2, 0]}
          castShadow
        />

        {/* Enhanced Door Handle with Phase 2 styling */}
        <mesh
          geometry={handleGeometry}
          material={handleMaterial}
          position={[
            -(door.width - frameThickness * 2) * 0.8,
            0,
            (door.thickness || 0.2) * 0.4
          ]}
          rotation={door.properties3D?.handleStyle === 'modern' ? [0, 0, 0] : [Math.PI / 2, 0, 0]}
          castShadow
        />
      </animated.group>

      {/* Enhanced Door Arc visualization for Phase 2 */}
      {isSelected && (
        <mesh position={[door.width / 2 - frameThickness, 0.01, door.height / 2]}>
          <ringGeometry args={[0, door.width - frameThickness * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Phase 2: Wall connection indicator */}
      {isSelected && parentWall && (
        <mesh position={[0, door.height + 0.2, 0]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

export default Door3D;
