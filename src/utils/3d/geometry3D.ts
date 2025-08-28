import { Wall } from '@/stores/designStore';
import * as THREE from 'three';

// Stair generation functions
export interface StairTransform {
  position: { x: number; y: number; z: number };
  rotationY: number;
}

export function generateStraightStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number
): StairTransform[] {
  const transforms: StairTransform[] = [];

  for (let i = 0; i < steps; i++) {
    transforms.push({
      position: {
        x: i * stepDepth,
        y: i * stepHeight + stepHeight / 2,
        z: 0,
      },
      rotationY: 0,
    });
  }

  return transforms;
}

export function generateLShapedStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number
): StairTransform[] {
  const transforms: StairTransform[] = [];
  const stepsPerRun = Math.floor(steps / 2);
  const landingStep = stepsPerRun;

  // First run (straight)
  for (let i = 0; i < stepsPerRun; i++) {
    transforms.push({
      position: {
        x: i * stepDepth,
        y: i * stepHeight + stepHeight / 2,
        z: 0,
      },
      rotationY: 0,
    });
  }

  // Landing
  transforms.push({
    position: {
      x: landingStep * stepDepth,
      y: landingStep * stepHeight + stepHeight / 2,
      z: 0,
    },
    rotationY: 0,
  });

  // Second run (90 degrees turn)
  for (let i = 1; i < steps - stepsPerRun; i++) {
    transforms.push({
      position: {
        x: landingStep * stepDepth,
        y: (landingStep + i) * stepHeight + stepHeight / 2,
        z: i * stepDepth,
      },
      rotationY: Math.PI / 2,
    });
  }

  return transforms;
}

export function generateUShapedStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number
): StairTransform[] {
  const transforms: StairTransform[] = [];
  const stepsPerRun = Math.floor(steps / 3);

  // First run
  for (let i = 0; i < stepsPerRun; i++) {
    transforms.push({
      position: {
        x: i * stepDepth,
        y: i * stepHeight + stepHeight / 2,
        z: 0,
      },
      rotationY: 0,
    });
  }

  // First landing and turn
  const firstLandingX = stepsPerRun * stepDepth;
  // const firstLandingY = stepsPerRun * stepHeight; // Unused variable, commented out

  // Second run (180 degree turn)
  for (let i = 0; i < stepsPerRun; i++) {
    transforms.push({
      position: {
        x: firstLandingX,
        y: (stepsPerRun + i) * stepHeight + stepHeight / 2,
        z: (i + 1) * stepDepth,
      },
      rotationY: Math.PI / 2,
    });
  }

  // Third run (back parallel to first)
  for (let i = 0; i < steps - 2 * stepsPerRun; i++) {
    transforms.push({
      position: {
        x: firstLandingX - (i + 1) * stepDepth,
        y: (2 * stepsPerRun + i) * stepHeight + stepHeight / 2,
        z: stepsPerRun * stepDepth,
      },
      rotationY: Math.PI,
    });
  }

  return transforms;
}

export function generateSpiralStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number,
  radius: number = 2
): StairTransform[] {
  const transforms: StairTransform[] = [];
  const anglePerStep = (2 * Math.PI) / steps;

  for (let i = 0; i < steps; i++) {
    const angle = i * anglePerStep;
    transforms.push({
      position: {
        x: Math.cos(angle) * radius,
        y: i * stepHeight + stepHeight / 2,
        z: Math.sin(angle) * radius,
      },
      rotationY: angle + Math.PI / 2,
    });
  }

  return transforms;
}

export class GeometryGenerator {
  static createWallGeometry(
    wall: Wall,
    connectedWalls: { start: Wall[]; end: Wall[] }
  ): THREE.BufferGeometry {
    const wallStart = new THREE.Vector2(wall.start.x, wall.start.z);
    const wallEnd = new THREE.Vector2(wall.end.x, wall.end.z);
    const wallThickness = wall.thickness;
    const wallHeight = wall.height;

    let actualStart = wallStart.clone();
    let actualEnd = wallEnd.clone();

    // Helper to get the perpendicular vector for offsetting
    const getPerpendicular = (p1: THREE.Vector2, p2: THREE.Vector2) => {
      const dir = new THREE.Vector2().subVectors(p2, p1).normalize();
      return new THREE.Vector2(-dir.y, dir.x);
    };

    // Calculate intersection point for two lines
    const getLineIntersection = (
      p1: THREE.Vector2,
      p2: THREE.Vector2,
      p3: THREE.Vector2,
      p4: THREE.Vector2
    ): THREE.Vector2 | null => {
      const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (den === 0) return null; // Lines are parallel or collinear

      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / den;
      const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / den;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return new THREE.Vector2(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y));
      }
      return null;
    };

    // Adjust start point
    if (connectedWalls.start.length > 0) {
      const connectedWall = connectedWalls.start[0]; // Assuming one connected wall for now
      const otherWallStart = new THREE.Vector2(connectedWall.start.x, connectedWall.start.z);
      const otherWallEnd = new THREE.Vector2(connectedWall.end.x, connectedWall.end.z);

      // Calculate offset lines for current wall
      const wallDir = new THREE.Vector2().subVectors(wallEnd, wallStart).normalize();
      const wallPerp = getPerpendicular(wallStart, wallEnd).multiplyScalar(wallThickness / 2);

      const wallLine1_p1 = new THREE.Vector2().addVectors(wallStart, wallPerp);
      const wallLine1_p2 = new THREE.Vector2().addVectors(wallEnd, wallPerp);
      const wallLine2_p1 = new THREE.Vector2().subVectors(wallStart, wallPerp);
      const wallLine2_p2 = new THREE.Vector2().subVectors(wallEnd, wallPerp);

      // Calculate offset lines for connected wall
      const otherWallDir = new THREE.Vector2().subVectors(otherWallEnd, otherWallStart).normalize();
      const otherWallPerp = getPerpendicular(otherWallStart, otherWallEnd).multiplyScalar(wallThickness / 2);

      const otherWallLine1_p1 = new THREE.Vector2().addVectors(otherWallStart, otherWallPerp);
      const otherWallLine1_p2 = new THREE.Vector2().addVectors(otherWallEnd, otherWallPerp);
      const otherWallLine2_p1 = new THREE.Vector2().subVectors(otherWallStart, otherWallPerp);
      const otherWallLine2_p2 = new THREE.Vector2().subVectors(otherWallEnd, otherWallPerp);

      // Find intersection points of the outer edges
      let intersection1 = getLineIntersection(wallLine1_p1, wallLine1_p2, otherWallLine1_p1, otherWallLine1_p2);
      let intersection2 = getLineIntersection(wallLine2_p1, wallLine2_p2, otherWallLine2_p1, otherWallLine2_p2);

      if (intersection1 && intersection2) {
        // Determine which intersection point is the "outer" corner
        const center = new THREE.Vector2().addVectors(wallStart, otherWallStart).multiplyScalar(0.5);
        const dist1 = intersection1.distanceTo(center);
        const dist2 = intersection2.distanceTo(center);

        actualStart = dist1 > dist2 ? intersection1 : intersection2;
      } else {
        // Fallback to simple offset if no clear intersection (e.g., parallel walls)
        const offsetDir = new THREE.Vector2().subVectors(wallStart, otherWallStart).normalize();
        actualStart.add(offsetDir.multiplyScalar(wallThickness / 2));
      }
    }

    // Adjust end point (similar logic as start point)
    if (connectedWalls.end.length > 0) {
      const connectedWall = connectedWalls.end[0]; // Assuming one connected wall for now
      const otherWallStart = new THREE.Vector2(connectedWall.start.x, connectedWall.start.z);
      const otherWallEnd = new THREE.Vector2(connectedWall.end.x, connectedWall.end.z);

      const wallDir = new THREE.Vector2().subVectors(wallStart, wallEnd).normalize(); // Direction from end to start for consistency
      const wallPerp = getPerpendicular(wallEnd, wallStart).multiplyScalar(wallThickness / 2);

      const wallLine1_p1 = new THREE.Vector2().addVectors(wallEnd, wallPerp);
      const wallLine1_p2 = new THREE.Vector2().addVectors(wallStart, wallPerp);
      const wallLine2_p1 = new THREE.Vector2().subVectors(wallEnd, wallPerp);
      const wallLine2_p2 = new THREE.Vector2().subVectors(wallStart, wallPerp);

      const otherWallDir = new THREE.Vector2().subVectors(otherWallStart, otherWallEnd).normalize();
      const otherWallPerp = getPerpendicular(otherWallEnd, otherWallStart).multiplyScalar(wallThickness / 2);

      const otherWallLine1_p1 = new THREE.Vector2().addVectors(otherWallEnd, otherWallPerp);
      const otherWallLine1_p2 = new THREE.Vector2().addVectors(otherWallStart, otherWallPerp);
      const otherWallLine2_p1 = new THREE.Vector2().subVectors(otherWallEnd, otherWallPerp);
      const otherWallLine2_p2 = new THREE.Vector2().subVectors(otherWallStart, otherWallPerp);

      let intersection1 = getLineIntersection(wallLine1_p1, wallLine1_p2, otherWallLine1_p1, otherWallLine1_p2);
      let intersection2 = getLineIntersection(wallLine2_p1, wallLine2_p2, otherWallLine2_p1, otherWallLine2_p2);

      if (intersection1 && intersection2) {
        const center = new THREE.Vector2().addVectors(wallEnd, otherWallEnd).multiplyScalar(0.5);
        const dist1 = intersection1.distanceTo(center);
        const dist2 = intersection2.distanceTo(center);

        actualEnd = dist1 > dist2 ? intersection1 : intersection2;
      } else {
        const offsetDir = new THREE.Vector2().subVectors(wallEnd, otherWallEnd).normalize();
        actualEnd.add(offsetDir.multiplyScalar(wallThickness / 2));
      }
    }

    // Create the geometry based on adjusted start and end points
    const path = new THREE.LineCurve3(
      new THREE.Vector3(actualStart.x, 0, actualStart.y),
      new THREE.Vector3(actualEnd.x, 0, actualEnd.y)
    );

    const shape = new THREE.Shape();
    shape.moveTo(-wallThickness / 2, 0);
    shape.lineTo(wallThickness / 2, 0);
    shape.lineTo(wallThickness / 2, wallHeight);
    shape.lineTo(-wallThickness / 2, wallHeight);
    shape.lineTo(-wallThickness / 2, 0);

    const extrudeSettings = {
      steps: 1,
      bevelEnabled: false,
      extrudePath: path,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); // Center the geometry for proper positioning in Wall3D

    return geometry;
  }

  static createRoomFloorGeometry(roomWalls: Wall[]): THREE.ExtrudeGeometry | null {
    if (roomWalls.length < 3) return null;

    const orderedWalls: Wall[] = [];
    if (roomWalls.length === 0) return null;

    let currentWall = roomWalls[0];
    const remainingWalls = [...roomWalls.slice(1)];
    orderedWalls.push(currentWall);

    while (remainingWalls.length > 0) {
      const currentEndpoint = currentWall.end;
      let foundNext = false;
      for (let i = 0; i < remainingWalls.length; i++) {
        const nextWall = remainingWalls[i];
        if (
          Math.abs(nextWall.start.x - currentEndpoint.x) < 0.01 &&
          Math.abs(nextWall.start.z - currentEndpoint.z) < 0.01
        ) {
          orderedWalls.push(nextWall);
          currentWall = nextWall;
          remainingWalls.splice(i, 1);
          foundNext = true;
          break;
        } else if (
          Math.abs(nextWall.end.x - currentEndpoint.x) < 0.01 &&
          Math.abs(nextWall.end.z - currentEndpoint.z) < 0.01
        ) {
          // Reverse the wall direction and add it
          const reversedWall = { ...nextWall, start: nextWall.end, end: nextWall.start };
          orderedWalls.push(reversedWall);
          currentWall = reversedWall;
          remainingWalls.splice(i, 1);
          foundNext = true;
          break;
        }
      }
      if (!foundNext) {
        // Could not find a closed loop, return null
        return null;
      }
    }

    const points = orderedWalls.map(w => new THREE.Vector2(w.start.x, w.start.z));
    const shape = new THREE.Shape(points);
    const extrudeSettings = {
      steps: 1,
      depth: 0.1, // Thickness of the floor
      bevelEnabled: false,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    return geometry;
  }

  static createRoomCeilingGeometry(roomWalls: Wall[]): THREE.ExtrudeGeometry | null {
    const floorGeometry = GeometryGenerator.createRoomFloorGeometry(roomWalls);
    if (!floorGeometry) return null;
    return floorGeometry.clone();
  }
}
