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
  ): THREE.BoxGeometry {
    const start = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
    const end = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);

    const wallDir = new THREE.Vector2(end.x - start.x, end.z - start.z).normalize();

    if (connectedWalls.start.length > 0) {
      const otherWall = connectedWalls.start[0];
      const otherDir = new THREE.Vector2(
        otherWall.end.x - otherWall.start.x,
        otherWall.end.z - otherWall.start.z
      ).normalize();
      const angle = wallDir.angle() - otherDir.angle();

      if (Math.abs(Math.abs(angle) - Math.PI) > 0.01) {
        const offset = wall.thickness / 2 / Math.tan(Math.abs(angle) / 2);
        start.x += wallDir.x * offset;
        start.z += wallDir.y * offset;
      }
    }

    if (connectedWalls.end.length > 0) {
      const otherWall = connectedWalls.end[0];
      const otherDir = new THREE.Vector2(
        otherWall.end.x - otherWall.start.x,
        otherWall.end.z - otherWall.start.z
      ).normalize();
      const angle = wallDir.angle() - otherDir.angle();

      if (Math.abs(Math.abs(angle) - Math.PI) > 0.01) {
        const offset = wall.thickness / 2 / Math.tan(Math.abs(angle) / 2);
        end.x -= wallDir.x * offset;
        end.z -= wallDir.y * offset;
      }
    }

    const length = start.distanceTo(end);
    const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
    geometry.translate(0, 0, 0);

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
