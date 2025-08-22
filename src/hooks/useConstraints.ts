import { useCallback, useState } from 'react';
import * as THREE from 'three';

export interface Constraints {
  snapToGrid: boolean;
  gridSize: number;
  snapToAngle: boolean;
  angleIncrement: number; // in degrees
  constrainDistance: boolean;
  maxDistance: number;
}

export interface ConstraintOptions {
  snapToGrid?: boolean;
  gridSize?: number;
  snapToAngle?: boolean;
  angleIncrement?: number;
  constrainDistance?: boolean;
  maxDistance?: number;
}

export const DEFAULT_CONSTRAINTS: Constraints = {
  snapToGrid: true,
  gridSize: 0.1,
  snapToAngle: true,
  angleIncrement: 15,
  constrainDistance: false,
  maxDistance: 10,
};

export function useConstraints(initialConstraints: ConstraintOptions = {}) {
  const [constraints, setConstraints] = useState<Constraints>({
    ...DEFAULT_CONSTRAINTS,
    ...initialConstraints,
  });

  const applyGridSnap = useCallback(
    (position: THREE.Vector3): THREE.Vector3 => {
      if (!constraints.snapToGrid) return position;

      const snapped = position.clone();
      snapped.x = Math.round(snapped.x / constraints.gridSize) * constraints.gridSize;
      snapped.z = Math.round(snapped.z / constraints.gridSize) * constraints.gridSize;
      return snapped;
    },
    [constraints.snapToGrid, constraints.gridSize]
  );

  const applyAngleSnap = useCallback(
    (angle: number): number => {
      if (!constraints.snapToAngle) return angle;

      const incrementRad = THREE.MathUtils.degToRad(constraints.angleIncrement);
      return Math.round(angle / incrementRad) * incrementRad;
    },
    [constraints.snapToAngle, constraints.angleIncrement]
  );

  const applyDistanceConstraint = useCallback(
    (start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3 => {
      if (!constraints.constrainDistance) return end;

      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const distance = Math.min(start.distanceTo(end), constraints.maxDistance);
      return new THREE.Vector3().addVectors(start, direction.multiplyScalar(distance));
    },
    [constraints.constrainDistance, constraints.maxDistance]
  );

  const updateConstraints = useCallback((newConstraints: Partial<Constraints>) => {
    setConstraints(prev => ({ ...prev, ...newConstraints }));
  }, []);

  return {
    constraints,
    updateConstraints,
    applyGridSnap,
    applyAngleSnap,
    applyDistanceConstraint,
  };
}
