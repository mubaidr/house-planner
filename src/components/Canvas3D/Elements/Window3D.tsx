'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Window } from '@/types';
import * as THREE from 'three';

interface Window3DProps {
  window: Window;
  isSelected: boolean;
  onClick?: () => void;
}

export const Window3D: React.FC<Window3DProps> = ({ window, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Calculate rotation for opening animation (for casement windows)
  const { rotation } = useSpring({
    rotation: isOpen ? Math.PI / 4 : 0,
    config: { tension: 120, friction: 14 }
  });

  // Get window position
  const windowPosition = useMemo(() => {
    if (typeof window.position === 'object') {
      return window.position;
    }
    return { x: 0, y: window.sillHeight || 1, z: 0 }; // Default position with sill height
  }, [window.position, window.sillHeight]);

  // Window frame geometry
  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = window.width;
    const height = window.height;
    const frameThickness = window.properties3D?.frameThickness || 0.08;

    // Outer rectangle
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    // Inner rectangle (glass opening)
    const hole = new THREE.Path();
    hole.moveTo(frameThickness, frameThickness);
    hole.lineTo(width - frameThickness, frameThickness);
    hole.lineTo(width - frameThickness, height - frameThickness);
    hole.lineTo(frameThickness, height - frameThickness);
    hole.lineTo(frameThickness, frameThickness);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: window.thickness || 0.15,
      bevelEnabled: false
    });
  }, [window.width, window.height, window.thickness, window.properties3D?.frameThickness]);

  // Glass pane geometry
  const glassGeometry = useMemo(() => {
    const frameThickness = window.properties3D?.frameThickness || 0.08;
    const glassWidth = window.width - frameThickness * 2;
    const glassHeight = window.height - frameThickness * 2;
    return new THREE.PlaneGeometry(glassWidth, glassHeight);
  }, [window.width, window.height, window.properties3D?.frameThickness]);

  // Window sill geometry
  const sillGeometry = useMemo(() => {
    const sillDepth = 0.1;
    const sillHeight = 0.05;
    return new THREE.BoxGeometry(window.width + 0.1, sillHeight, sillDepth);
  }, [window.width]);

  // Materials
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: window.material?.color || window.color || '#FFFFFF',
    roughness: window.material?.properties?.roughness || 0.6,
    metalness: window.material?.properties?.metalness || 0.2
  });

  // Glass material based on type
  const getGlassMaterial = () => {
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
  };

  const glassMaterial = useMemo(() => getGlassMaterial(), [window.properties3D?.glassType]);

  const sillMaterial = new THREE.MeshStandardMaterial({
    color: window.material?.color || window.color || '#E0E0E0',
    roughness: 0.7,
    metalness: 0.1
  });

  // Selection outline effect
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
      position={[windowPosition.x, windowPosition.y, windowPosition.z]}
      rotation={[0, window.rotation || 0, 0]}
      onClick={handleWindowClick}
    >
      {/* Window Sill */}
      <mesh
        geometry={sillGeometry}
        material={sillMaterial}
        position={[window.width / 2, -0.025, -(window.thickness || 0.15) / 2 - 0.05]}
      />

      {/* Window Frame */}
      <mesh geometry={frameGeometry} material={frameMaterial} />

      {/* Animated Glass Panes (for casement style) */}
      {frameStyle === 'modern' ? (
        // Single pane
        <mesh
          geometry={glassGeometry}
          material={glassMaterial}
          position={[window.width / 2, window.height / 2, 0.001]}
        />
      ) : (
        // Multi-pane with opening capability
        <animated.group
          position={[window.width / 2, window.height / 2, 0]}
          rotation-y={rotation}
        >
          <mesh
            geometry={glassGeometry}
            material={glassMaterial}
            position={[0, 0, 0.001]}
          />

          {/* Window dividers for classic style */}
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

      {/* Window Selection Outline */}
      {isSelected && (
        <mesh position={[window.width / 2, window.height / 2, 0.01]}>
          <ringGeometry args={[0, Math.max(window.width, window.height) / 2, 0, Math.PI * 2]} />
          <meshBasicMaterial color="#0099ff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default Window3D;
