'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useSpring, animated } from '@react-spring/three';
import { Door } from '@/types';
import { useDesignStore } from '@/stores/designStore';
import * as THREE from 'three';

interface PhysicsDoor3DProps {
  door: Door;
  isSelected: boolean;
  onClick?: () => void;
}

export const PhysicsDoor3D: React.FC<PhysicsDoor3DProps> = ({ door, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(false);
  const { scene3D } = useDesignStore();

  // Get door position
  const doorPosition = useMemo(() => {
    if (typeof door.position === 'object') {
      return door.position;
    }
    return { x: 0, y: 0, z: 0 };
  }, [door.position]);

  // Physics vs Animation toggle
  const usePhysics = scene3D.physics?.enabled && isPhysicsEnabled;

  // Animation spring (for non-physics mode)
  const { rotation } = useSpring({
    rotation: usePhysics ? 0 : (isOpen ? Math.PI / 2 : 0),
    config: { tension: 120, friction: 14 }
  });

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

  // Handle door interaction
  const handleDoorClick = useCallback((event: any) => {
    event?.stopPropagation?.();

    if (onClick) {
      onClick();
    } else {
      if (usePhysics && rigidBodyRef.current) {
        // Apply physics impulse to open/close door
        const impulse = isOpen ? { x: -2, y: 0, z: 0 } : { x: 2, y: 0, z: 0 };
        rigidBodyRef.current.applyImpulse(impulse, true);
        setIsOpen(!isOpen);
      } else {
        // Use animation
        setIsOpen(!isOpen);
      }
    }
  }, [onClick, usePhysics, isOpen]);

  // Toggle physics mode
  const togglePhysics = useCallback(() => {
    setIsPhysicsEnabled(!isPhysicsEnabled);
  }, [isPhysicsEnabled]);

  const frameThickness = door.properties3D?.frameThickness || 0.1;

  // Physics-enabled door
  if (usePhysics) {
    return (
      <group
        ref={groupRef}
        position={[doorPosition.x, doorPosition.y, doorPosition.z]}
        rotation={[0, door.rotation || 0, 0]}
      >
        {/* Static Door Frame */}
        <mesh geometry={frameGeometry} material={frameMaterial} />

        {/* Physics Door Panel with Hinge Joint */}
        <RigidBody
          ref={rigidBodyRef}
          type="dynamic"
          position={[door.width / 2 - frameThickness, door.height / 2 - frameThickness, 0]}
          colliders={false}
          linearDamping={0.8}
          angularDamping={0.8}
        >
          <CuboidCollider
            args={[
              (door.width - frameThickness * 2) / 2,
              (door.height - frameThickness * 2) / 2,
              (door.thickness || 0.2) * 0.4
            ]}
          />

          <mesh
            geometry={panelGeometry}
            material={panelMaterial}
            position={[-(door.width - frameThickness * 2) / 2, -(door.height - frameThickness * 2) / 2, 0]}
            onClick={handleDoorClick}
          />

          {/* Door Handle */}
          <mesh
            geometry={handleGeometry}
            material={handleMaterial}
            position={[-(door.width - frameThickness * 2) * 0.8, 0, (door.thickness || 0.2) * 0.4]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </RigidBody>

        {/* Physics Controls UI */}
        {isSelected && (
          <group position={[door.width / 2, door.height + 1, 0]}>
            <mesh onClick={togglePhysics}>
              <boxGeometry args={[1, 0.3, 0.1]} />
              <meshBasicMaterial
                color={isPhysicsEnabled ? '#00ff00' : '#ff0000'}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        )}

        {/* Door Arc (opening path visualization) */}
        {isSelected && (
          <mesh position={[door.width / 2 - frameThickness, 0.01, door.height / 2]}>
            <ringGeometry args={[0, door.width - frameThickness * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    );
  }

  // Animation-based door (original)
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

      {/* Physics Toggle Control */}
      {isSelected && (
        <group position={[door.width / 2, door.height + 1, 0]}>
          <mesh onClick={togglePhysics}>
            <boxGeometry args={[1, 0.3, 0.1]} />
            <meshBasicMaterial
              color={isPhysicsEnabled ? '#00ff00' : '#ff0000'}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

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

export default PhysicsDoor3D;
