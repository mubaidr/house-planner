'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { useDesignStore } from '@/stores/designStore';
import { Window } from '@/types';
import {
  calculateWindowPositionOnWall,
  createWindowGeometries,
  getMaterialProperties
} from '@/utils/3d/geometryUtils';
import * as THREE from 'three';

interface Window3DProps {
  window: Window;
  isSelected: boolean;
  onClick?: () => void;
}

export const Window3D: React.FC<Window3DProps> = ({ window, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const { walls, materials } = useDesignStore();

  // Find the wall this window belongs to
  const parentWall = useMemo(() =>
    walls.find(wall => wall.id === window.wallId),
    [walls, window.wallId]
  );

  // Calculate window position using Phase 2 utilities
  const { position, rotation } = useMemo(() => {
    if (parentWall) {
      return calculateWindowPositionOnWall(window, parentWall);
    }
    // Fallback to absolute position if no wall found
    if (typeof window.position === 'object') {
      return {
        position: [window.position.x, window.position.y, window.position.z] as [number, number, number],
        rotation: [0, window.rotation || 0, 0] as [number, number, number],
      };
    }
    return {
      position: [0, (window.sillHeight || 1) + window.height / 2, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    };
  }, [window, parentWall]);

  // Enhanced window geometries using Phase 2 utilities
  const { frameGeometry, glassGeometry, sillGeometry } = useMemo(() =>
    createWindowGeometries(window), [window]
  );

  // Calculate rotation for opening animation (for casement windows)
  const { openRotation } = useSpring({
    openRotation: isOpen ? Math.PI / 4 : 0,
    config: { tension: 120, friction: 14 }
  });

  // Enhanced material properties using Phase 2 utilities
  const frameMaterialProps = useMemo(() =>
    getMaterialProperties(window.materialId, materials, '#FFFFFF'),
    [window.materialId, materials]
  );

  // Enhanced frame material
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: frameMaterialProps.color,
    roughness: frameMaterialProps.roughness,
    metalness: frameMaterialProps.metalness,
    transparent: frameMaterialProps.opacity < 1,
    opacity: frameMaterialProps.opacity,
  }), [frameMaterialProps]);

  // Enhanced glass material based on type (Phase 2 feature)
  const glassMaterial = useMemo(() => {
    const glassType = window.properties3D?.glassType || 'clear';
    const baseProps = {
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.02
    };

    switch (glassType) {
      case 'tinted':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          color: '#E6F3FF',
          opacity: 0.8
        });
      case 'frosted':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          color: '#F0F8FF',
          opacity: 0.6,
          roughness: 0.8
        });
      default: // clear
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          color: '#FFFFFF',
          opacity: 0.1
        });
    }
  }, [window.properties3D?.glassType]);

  // Enhanced sill material
  const sillMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: frameMaterialProps.color,
    roughness: frameMaterialProps.roughness * 1.1, // Slightly rougher than frame
    metalness: frameMaterialProps.metalness * 0.5,
  }), [frameMaterialProps]);

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

  const handleWindowClick = (event: any) => {
    event?.stopPropagation?.();
    if (onClick) {
      onClick();
    } else {
      // Toggle window open/close if not in selection mode
      setIsOpen(!isOpen);
    }
  };

  const frameThickness = window.properties3D?.frameThickness || 0.08;
  const frameStyle = window.properties3D?.frameStyle || 'modern';

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleWindowClick}
      name={`window-${window.id}`}
    >
      {/* Enhanced Window Sill */}
      <mesh
        geometry={sillGeometry}
        material={sillMaterial}
        position={[window.width / 2, -0.025, -(window.thickness || 0.15) / 2 - 0.05]}
        castShadow
        receiveShadow
      />

      {/* Enhanced Window Frame with Phase 2 geometry */}
      <mesh
        geometry={frameGeometry}
        material={frameMaterial}
        castShadow
        receiveShadow
      />

      {/* Enhanced Glass Panes with Phase 2 features */}
      {frameStyle === 'modern' ? (
        // Single pane modern window
        <mesh
          geometry={glassGeometry}
          material={glassMaterial}
          position={[window.width / 2, window.height / 2, 0.001]}
        />
      ) : (
        // Multi-pane classic window with opening capability
        <animated.group
          position={[window.width / 2, window.height / 2, 0]}
          rotation-y={openRotation}
        >
          <mesh
            geometry={glassGeometry}
            material={glassMaterial}
            position={[0, 0, 0.001]}
          />

          {/* Enhanced window dividers for classic style */}
          {frameStyle === 'classic' && (
            <>
              {/* Horizontal divider */}
              <mesh position={[0, 0, 0.002]}>
                <boxGeometry args={[window.width - frameThickness * 2, 0.02, 0.01]} />
                <meshStandardMaterial color={frameMaterial.color} />
              </mesh>

              {/* Vertical divider */}
              <mesh position={[0, 0, 0.002]}>
                <boxGeometry args={[0.02, window.height - frameThickness * 2, 0.01]} />
                <meshStandardMaterial color={frameMaterial.color} />
              </mesh>
            </>
          )}
        </animated.group>
      )}

      {/* Enhanced selection outline for Phase 2 */}
      {isSelected && (
        <mesh position={[window.width / 2, window.height / 2, 0.01]}>
          <ringGeometry args={[0, Math.max(window.width, window.height) / 2, 0, Math.PI * 2]} />
          <meshBasicMaterial color="#0099ff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Phase 2: Wall connection indicator */}
      {isSelected && parentWall && (
        <mesh position={[window.width / 2, window.height + 0.2, 0]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshBasicMaterial color="#0099ff" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

export default Window3D;
