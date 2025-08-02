'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Html, TransformControls } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface TransformGizmoProps {
  targetRef: React.RefObject<THREE.Object3D>;
  mode?: 'translate' | 'rotate' | 'scale';
  enabled?: boolean;
  onTransformChange?: (object: THREE.Object3D) => void;
}

export function TransformGizmo({
  targetRef,
  mode = 'translate',
  enabled = true,
  onTransformChange,
}: TransformGizmoProps) {
  const transformRef = useRef<any>(null);
  const [currentMode, setCurrentMode] = useState<'translate' | 'rotate' | 'scale'>(mode);
  const [isDragging, setIsDragging] = useState(false);

  // Handle transform changes
  const handleChange = useCallback(() => {
    if (targetRef.current && onTransformChange) {
      onTransformChange(targetRef.current);
    }
  }, [targetRef, onTransformChange]);

  // Keyboard shortcuts for mode switching
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key.toLowerCase()) {
        case 'g':
          setCurrentMode('translate');
          break;
        case 'r':
          setCurrentMode('rotate');
          break;
        case 's':
          setCurrentMode('scale');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  if (!enabled || !targetRef.current) {
    return null;
  }

  return (
    <group>
      <TransformControls
        ref={transformRef}
        object={targetRef.current}
        mode={currentMode}
        size={1}
        showX={true}
        showY={true}
        showZ={true}
        space="world"
        onChange={handleChange}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      />

      {/* Control Panel */}
      <Html
        position={[
          targetRef.current.position.x,
          targetRef.current.position.y + 3,
          targetRef.current.position.z
        ]}
        center
        distanceFactor={10}
      >
        <div className="transform-controls bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setCurrentMode('translate')}
              className={`px-2 py-1 text-xs rounded ${
                currentMode === 'translate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📐 Move
            </button>
            <button
              onClick={() => setCurrentMode('rotate')}
              className={`px-2 py-1 text-xs rounded ${
                currentMode === 'rotate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔄 Rotate
            </button>
            <button
              onClick={() => setCurrentMode('scale')}
              className={`px-2 py-1 text-xs rounded ${
                currentMode === 'scale'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📏 Scale
            </button>
          </div>
        </div>
      </Html>

      {/* Grid visualization when dragging */}
      {isDragging && (
        <gridHelper
          args={[20, 40, '#4444ff', '#8888ff']}
          position={[0, 0.01, 0]}
        />
      )}
    </group>
  );
}

// Physics-based draggable object wrapper
interface PhysicsDraggableProps {
  children: React.ReactNode;
  elementId: string;
  elementType: string;
  enabled?: boolean;
  onDragEnd?: (position: THREE.Vector3) => void;
}

export function PhysicsDraggable({
  children,
  elementId,
  elementType,
  enabled = true,
  onDragEnd,
}: PhysicsDraggableProps) {
  const rigidBodyRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Spring animation for visual feedback
  const { scale } = useSpring({
    scale: isDragging ? 1.05 : 1,
    config: { tension: 300, friction: 30 }
  });

  // Handle drag with physics
  const handleClick = useCallback((event: any) => {
    if (!enabled || !rigidBodyRef.current) return;

    event.stopPropagation();
    setIsDragging(true);

    // Apply small physics impulse for interaction feedback
    const impulse = {
      x: (Math.random() - 0.5) * 0.5,
      y: 0.1,
      z: (Math.random() - 0.5) * 0.5,
    };

    rigidBodyRef.current.applyImpulse(impulse, true);

    // End drag after short delay
    setTimeout(() => {
      if (rigidBodyRef.current && onDragEnd) {
        const position = rigidBodyRef.current.translation();
        onDragEnd(new THREE.Vector3(position.x, position.y, position.z));
      }
      setIsDragging(false);
    }, 300);
  }, [enabled, onDragEnd]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders="cuboid"
      linearDamping={0.8}
      angularDamping={0.8}
      userData={{ elementId, elementType }}
    >
      <animated.group
        scale={scale}
        onClick={handleClick}
      >
        {children}
      </animated.group>
    </RigidBody>
  );
}

// Simple draggable wrapper for non-physics objects
interface DraggableObjectProps {
  children: React.ReactNode;
  onDrag?: (position: THREE.Vector3) => void;
  enabled?: boolean;
}

export function DraggableObject({
  children,
  onDrag,
  enabled = true,
}: DraggableObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { scale } = useSpring({
    scale: isDragging ? 1.02 : 1,
    config: { tension: 200, friction: 20 }
  });

  const handlePointerDown = useCallback((event: any) => {
    if (!enabled) return;
    event.stopPropagation();
    setIsDragging(true);
  }, [enabled]);

  const handlePointerUp = useCallback((event: any) => {
    if (!enabled) return;
    event.stopPropagation();
    setIsDragging(false);

    if (groupRef.current && onDrag) {
      onDrag(groupRef.current.position);
    }
  }, [enabled, onDrag]);

  const handlePointerMove = useCallback((event: any) => {
    if (!enabled || !isDragging || !groupRef.current) return;

    // Simple movement based on pointer position
    const factor = 0.01;
    groupRef.current.position.x += event.movementX * factor;
    groupRef.current.position.z += event.movementY * factor;
  }, [enabled, isDragging]);

  return (
    <animated.group
      ref={groupRef}
      scale={scale}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {children}
    </animated.group>
  );
}

export default TransformGizmo;
