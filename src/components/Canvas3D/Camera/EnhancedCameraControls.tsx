'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDesignStore } from '@/stores/designStore';
import * as THREE from 'three';

interface EnhancedCameraControlsProps {
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
  enableAutoRotate?: boolean;
  autoRotateSpeed?: number;
}

export function EnhancedCameraControls({
  enableDamping = true,
  dampingFactor = 0.05,
  minDistance = 2,
  maxDistance = 50,
  maxPolarAngle = Math.PI / 2.1,
  enableAutoRotate = false,
  autoRotateSpeed = 0.5,
}: EnhancedCameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const { setCameraPreset, updateCameraState } = useDesignStore();

  // Animation state
  const animationRef = useRef<{
    isAnimating: boolean;
    startPosition: THREE.Vector3;
    startTarget: THREE.Vector3;
    endPosition: THREE.Vector3;
    endTarget: THREE.Vector3;
    startTime: number;
    duration: number;
  } | null>(null);

  // Smooth camera animation function
  const animateToPosition = useCallback((
    targetPosition: [number, number, number],
    targetTarget: [number, number, number],
    duration: number = 1500
  ) => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    animationRef.current = {
      isAnimating: true,
      startPosition: camera.position.clone(),
      startTarget: controls.target.clone(),
      endPosition: new THREE.Vector3(...targetPosition),
      endTarget: new THREE.Vector3(...targetTarget),
      startTime: Date.now(),
      duration,
    };
  }, [camera]);

  // Handle camera preset changes
  useEffect(() => {
    const unsubscribe = useDesignStore.subscribe(
      (state) => state.scene3D.camera,
      (cameraState, prevCameraState) => {
        if (
          cameraState.position !== prevCameraState.position ||
          cameraState.target !== prevCameraState.target
        ) {
          animateToPosition(cameraState.position, cameraState.target);
        }
      }
    );

    return unsubscribe;
  }, [animateToPosition]);

  // Animation frame
  useFrame(() => {
    if (animationRef.current?.isAnimating) {
      const { startPosition, startTarget, endPosition, endTarget, startTime, duration } = animationRef.current;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function (cubic ease out)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate camera position and target
      camera.position.lerpVectors(startPosition, endPosition, eased);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(startTarget, endTarget, eased);
        controlsRef.current.update();
      }

      // Update camera state in store
      updateCameraState({
        position: camera.position.toArray() as [number, number, number],
        target: controlsRef.current?.target.toArray() as [number, number, number],
        fov: (camera as THREE.PerspectiveCamera).fov || 50,
        zoom: camera.zoom,
      });

      // End animation
      if (progress >= 1) {
        animationRef.current.isAnimating = false;
      }
    }
  });

  // Handle manual camera changes
  const handleChange = useCallback(() => {
    if (!controlsRef.current || animationRef.current?.isAnimating) return;

    updateCameraState({
      position: camera.position.toArray() as [number, number, number],
      target: controlsRef.current.target.toArray() as [number, number, number],
      fov: (camera as THREE.PerspectiveCamera).fov || 50,
      zoom: camera.zoom,
    });
  }, [camera, updateCameraState]);

  // Keyboard shortcuts for camera presets
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setCameraPreset('perspective');
            break;
          case '2':
            event.preventDefault();
            setCameraPreset('top');
            break;
          case '3':
            event.preventDefault();
            setCameraPreset('front');
            break;
          case '4':
            event.preventDefault();
            setCameraPreset('isometric');
            break;
          case '0':
            event.preventDefault();
            // Reset to default perspective
            animateToPosition([10, 10, 10], [0, 0, 0]);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraPreset, animateToPosition]);

  // Double-click to focus on object
  const handleDoubleClick = useCallback((event: MouseEvent) => {
    if (!controlsRef.current) return;

    // Raycast to find intersection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Get all scene objects from Three.js scene
    const threeScene = camera.parent;
    if (threeScene) {
      const intersects = raycaster.intersectObjects(threeScene.children, true);

      if (intersects.length > 0) {
        const target = intersects[0].point;
        const distance = camera.position.distanceTo(target);
        const direction = camera.position.clone().sub(target).normalize();
        const newPosition = target.clone().add(direction.multiplyScalar(Math.max(distance * 0.5, 5)));

        animateToPosition(
          newPosition.toArray() as [number, number, number],
          target.toArray() as [number, number, number]
        );
      }
    }
  }, [camera, gl, animateToPosition]);  useEffect(() => {
    gl.domElement.addEventListener('dblclick', handleDoubleClick);
    return () => gl.domElement.removeEventListener('dblclick', handleDoubleClick);
  }, [gl.domElement, handleDoubleClick]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={maxPolarAngle}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={enableAutoRotate}
      autoRotateSpeed={autoRotateSpeed}
      onChange={handleChange}
      makeDefault
    />
  );
}

export default EnhancedCameraControls;
