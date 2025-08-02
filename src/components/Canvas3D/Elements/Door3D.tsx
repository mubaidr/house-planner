'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Door } from '@/types';
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

  // Calculate rotation for opening animation
  const { rotation } = useSpring({
    rotation: isOpen ? Math.PI / 2 : 0,
    config: { tension: 120, friction: 14 }
  });

  // Get door position
  const doorPosition = useMemo(() => {
    if (typeof door.position === 'object') {
      return door.position;
    }
    return { x: 0, y: 0, z: 0 }; // Default position for wall-relative doors
  }, [door.position]);

  // Door frame geometry
  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = door.width;
    const height = door.height;
    const frameThickness = door.properties3D?.frameThickness || 0.1;

    // Outer rectangle
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    // Inner rectangle (door opening)
    const hole = new THREE.Path();
    hole.moveTo(frameThickness, frameThickness);
    hole.lineTo(width - frameThickness, frameThickness);
    hole.lineTo(width - frameThickness, height - frameThickness);
    hole.lineTo(frameThickness, height - frameThickness);
    hole.lineTo(frameThickness, frameThickness);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: door.thickness || 0.2,
      bevelEnabled: false
    });
  }, [door.width, door.height, door.thickness, door.properties3D?.frameThickness]);

  // Door panel geometry
  const panelGeometry = useMemo(() => {
    const frameThickness = door.properties3D?.frameThickness || 0.1;
    const panelWidth = door.width - frameThickness * 2;
    const panelHeight = door.height - frameThickness * 2;
    return new THREE.BoxGeometry(panelWidth, panelHeight, (door.thickness || 0.2) * 0.8);
  }, [door.width, door.height, door.thickness, door.properties3D?.frameThickness]);

  // Handle geometry
  const handleGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
  }, []);

  // Materials
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: door.material?.color || door.color || '#8B4513',
    roughness: door.material?.properties?.roughness || 0.8,
    metalness: door.material?.properties?.metalness || 0.1
  });

  const panelMaterial = new THREE.MeshStandardMaterial({
    color: door.material?.color || door.color || '#D2691E',
    roughness: door.material?.properties?.roughness || 0.7,
    metalness: door.material?.properties?.metalness || 0.1
  });

  const handleMaterial = new THREE.MeshStandardMaterial({
    color: '#FFD700',
    roughness: 0.3,
    metalness: 0.8
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
      position={[doorPosition.x, doorPosition.y, doorPosition.z]}
      rotation={[0, door.rotation || 0, 0]}
      onClick={handleDoorClick}
    >
      {/* Door Frame */}
      <mesh geometry={frameGeometry} material={frameMaterial} />

      {/* Animated Door Panel */}
      <animated.group
        position={[door.width / 2 - frameThickness, door.height / 2 - frameThickness, 0]}
        rotation-y={rotation}
      >
        <mesh
          ref={doorPanelRef}
          geometry={panelGeometry}
          material={panelMaterial}
          position={[-(door.width - frameThickness * 2) / 2, -(door.height - frameThickness * 2) / 2, 0]}
        />

        {/* Door Handle */}
        <mesh
          geometry={handleGeometry}
          material={handleMaterial}
          position={[-(door.width - frameThickness * 2) * 0.8, 0, (door.thickness || 0.2) * 0.4]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </animated.group>

      {/* Door Arc (opening path visualization) */}
      {isSelected && (
        <mesh position={[door.width / 2 - frameThickness, 0.01, door.height / 2]}>
          <ringGeometry args={[0, door.width - frameThickness * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default Door3D;
