import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

export interface TransitionOptions {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface Transition3D {
  isTransitioning: boolean;
  progress: number;
  startTransition: (
    from: THREE.Vector3 | THREE.Euler | number,
    to: THREE.Vector3 | THREE.Euler | number,
    options?: Partial<TransitionOptions>
  ) => Promise<void>;
  stopTransition: () => void;
}

const defaultOptions: TransitionOptions = {
  duration: 1000,
  easing: 'easeInOut'
};

const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};

export function use3DTransition(): Transition3D {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopTransition = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsTransitioning(false);
    setProgress(0);
  }, []);

  const startTransition = useCallback((
    from: THREE.Vector3 | THREE.Euler | number,
    to: THREE.Vector3 | THREE.Euler | number,
    options: Partial<TransitionOptions> = {}
  ): Promise<void> => {
    return new Promise((resolve) => {
      const opts = { ...defaultOptions, ...options };
      
      // Stop any existing transition
      stopTransition();
      
      setIsTransitioning(true);
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const rawProgress = Math.min(elapsed / opts.duration, 1);
        const easedProgress = easingFunctions[opts.easing](rawProgress);
        
        setProgress(easedProgress);
        
        // Call update callback if provided
        if (opts.onUpdate) {
          opts.onUpdate(easedProgress);
        }

        if (rawProgress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Transition complete
          setIsTransitioning(false);
          setProgress(1);
          
          if (opts.onComplete) {
            opts.onComplete();
          }
          
          resolve();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });
  }, [stopTransition]);

  return {
    isTransitioning,
    progress,
    startTransition,
    stopTransition
  };
}

// Utility functions for common 3D transitions
export function lerpVector3(from: THREE.Vector3, to: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(from, to, t);
}

export function lerpEuler(from: THREE.Euler, to: THREE.Euler, t: number): THREE.Euler {
  const fromQuat = new THREE.Quaternion().setFromEuler(from);
  const toQuat = new THREE.Quaternion().setFromEuler(to);
  const resultQuat = new THREE.Quaternion().slerpQuaternions(fromQuat, toQuat, t);
  return new THREE.Euler().setFromQuaternion(resultQuat);
}

export function lerpNumber(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}