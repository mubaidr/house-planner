import { useCallback, useState } from 'react';
import * as THREE from 'three';

export interface Constraints {
  snapToGrid: boolean;
  gridSize: number;
  snapToAngle: boolean;
  angleIncrement: number; // in degrees
  constrainDistance: boolean;
  maxDistance: number;
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
  snapDistance: number; // Distance threshold for snapping
}

export interface ConstraintOptions {
  snapToGrid?: boolean;
  gridSize?: number;
  snapToAngle?: boolean;
  angleIncrement?: number;
  constrainDistance?: boolean;
  maxDistance?: number;
  snapToEndpoints?: boolean;
  snapToMidpoints?: boolean;
  snapToIntersections?: boolean;
  snapDistance?: number;
}

export const DEFAULT_CONSTRAINTS: Constraints = {
  snapToGrid: true,
  gridSize: 0.1,
  snapToAngle: true,
  angleIncrement: 15,
  constrainDistance: false,
  maxDistance: 10,
  snapToEndpoints: true,
  snapToMidpoints: true,
  snapToIntersections: true,
  snapDistance: 0.5,
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

  // Helper function to calculate line intersection
  const calculateLineIntersection = useCallback(
    (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
      x4: number,
      y4: number
    ): { x: number; y: number } | null => {
      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (Math.abs(den) < 1e-10) return null; // Lines are parallel

      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1),
        };
      }

      return null;
    },
    []
  );

  const findSnapPoints = useCallback(
    (position: THREE.Vector3, walls: any[]): THREE.Vector3 | null => {
      if (
        !constraints.snapToEndpoints &&
        !constraints.snapToMidpoints &&
        !constraints.snapToIntersections
      ) {
        return null;
      }

      let closestPoint: THREE.Vector3 | null = null;
      let closestDistance = constraints.snapDistance;

      for (const wall of walls) {
        // Endpoint snapping
        if (constraints.snapToEndpoints) {
          const startPoint = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
          const endPoint = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);

          const startDistance = position.distanceTo(startPoint);
          const endDistance = position.distanceTo(endPoint);

          if (startDistance < closestDistance) {
            closestPoint = startPoint;
            closestDistance = startDistance;
          }
          if (endDistance < closestDistance) {
            closestPoint = endPoint;
            closestDistance = endDistance;
          }
        }

        // Midpoint snapping
        if (constraints.snapToMidpoints) {
          const startPoint = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
          const endPoint = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);
          const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);

          const midDistance = position.distanceTo(midpoint);
          if (midDistance < closestDistance) {
            closestPoint = midpoint;
            closestDistance = midDistance;
          }
        }
      }

      // Intersection snapping
      if (constraints.snapToIntersections && walls.length > 1) {
        for (let i = 0; i < walls.length; i++) {
          for (let j = i + 1; j < walls.length; j++) {
            const wall1 = walls[i];
            const wall2 = walls[j];

            // Calculate intersection point
            const intersection = calculateLineIntersection(
              wall1.start.x,
              wall1.start.z,
              wall1.end.x,
              wall1.end.z,
              wall2.start.x,
              wall2.start.z,
              wall2.end.x,
              wall2.end.z
            );

            if (intersection) {
              const intersectionPoint = new THREE.Vector3(intersection.x, 0, intersection.y);
              const distance = position.distanceTo(intersectionPoint);
              if (distance < closestDistance) {
                closestPoint = intersectionPoint;
                closestDistance = distance;
              }
            }
          }
        }
      }

      return closestPoint;
    },
    [constraints, calculateLineIntersection]
  );

  const applyAdvancedSnap = useCallback(
    (position: THREE.Vector3, walls: any[]): THREE.Vector3 => {
      // First apply grid snap
      let snappedPosition = applyGridSnap(position);

      // Then check for advanced snapping
      const snapPoint = findSnapPoints(snappedPosition, walls);
      if (snapPoint) {
        return snapPoint;
      }

      return snappedPosition;
    },
    [applyGridSnap, findSnapPoints]
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
    findSnapPoints,
    applyAdvancedSnap,
  };
}
