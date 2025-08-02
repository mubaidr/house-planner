'use client';

import React, { useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/three';
import { useDesignStore } from '@/stores/designStore';
import * as THREE from 'three';

interface GestureHandler3DProps {
  children: React.ReactNode;
}

export const GestureHandler3D: React.FC<GestureHandler3DProps> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene3D, updateCameraState } = useDesignStore();

  // Spring values for smooth gestures
  const [{ scale, rotationY }, api] = useSpring(() => ({
    scale: 1,
    rotationY: 0,
    config: { tension: 300, friction: 40 }
  }));

  // Gesture handlers
  const bind = useGesture(
    {
      // Pinch to zoom
      onPinch: ({ offset: [scale] }) => {
        api.start({ scale: Math.max(0.5, Math.min(2, scale)) });
      },

      // Drag to rotate scene
      onDrag: ({ offset: [x, y], ctrlKey, metaKey }) => {
        if (ctrlKey || metaKey) {
          // Rotate the scene when holding Ctrl/Cmd
          const rotationY = (x / window.innerWidth) * Math.PI * 2;
          api.start({ rotationY });
        } else {
          // Update camera position for orbit controls
          const sensitivity = 0.01;
          const phi = y * sensitivity;
          const theta = x * sensitivity;

          // Calculate new camera position
          const camera = scene3D.camera;
          const radius = new THREE.Vector3(...camera.position).length();

          const newPosition = [
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          ] as [number, number, number];

          updateCameraState({
            position: newPosition,
            target: camera.target
          });
        }
      },

      // Wheel for smooth zooming
      onWheel: ({ delta: [, dy] }) => {
        const camera = scene3D.camera;
        const currentPosition = new THREE.Vector3(...camera.position);
        const direction = new THREE.Vector3(...camera.target).sub(currentPosition).normalize();

        const zoomSpeed = 0.1;
        const newPosition = currentPosition.add(direction.multiplyScalar(dy * zoomSpeed));

        updateCameraState({
          position: newPosition.toArray() as [number, number, number],
          target: camera.target
        });
      },

      // Double tap to reset view
      onDoubleClick: () => {
        api.start({
          scale: 1,
          rotationY: 0
        });

        // Reset camera to default position
        updateCameraState({
          position: [10, 10, 10],
          target: [0, 0, 0]
        });
      }
    },
    {
      eventOptions: { passive: false },
      transform: ([x, y]) => [x, y],
      drag: {
        threshold: 10,
        filterTaps: true
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 2 },
        rubberband: true
      }
    }
  );

  return (
    <animated.group
      ref={groupRef}
      {...bind()}
      scale={scale}
      rotation-y={rotationY}
    >
      {children}
    </animated.group>
  );
};

export default GestureHandler3D;
