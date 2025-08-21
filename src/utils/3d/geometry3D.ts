import type { Vector3 } from '@/stores/designStore';

export interface StepTransform {
  position: Vector3; // local step center position
  rotationY: number; // rotation around Y axis in radians
}

/**
 * Generate straight stairs (simple linear steps along X)
 */
export function generateStraightStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number
) {
  const transforms: StepTransform[] = [];
  for (let i = 0; i < steps; i++) {
    const x = (i + 0.5) * stepDepth - (steps * stepDepth) / 2;
    const y = (i + 0.5) * stepHeight;
    const z = 0;
    transforms.push({ position: { x, y, z }, rotationY: 0 });
  }
  return transforms;
}

/**
 * Generate a simple L-shaped stair: half the steps along +X then turn 90deg and continue along +Z.
 * This is a basic generator that splits steps into two legs.
 */
export function generateLShapedStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number
) {
  const transforms: StepTransform[] = [];
  const firstLeg = Math.ceil(steps / 2);
  const secondLeg = steps - firstLeg;

  // First leg along X
  for (let i = 0; i < firstLeg; i++) {
    const x = (i + 0.5) * stepDepth - (firstLeg * stepDepth) / 2;
    const y = (i + 0.5) * stepHeight;
    transforms.push({ position: { x, y, z: 0 }, rotationY: 0 });
  }

  // Pivot point at end of first leg; continue along Z
  for (let j = 0; j < secondLeg; j++) {
    const x = (firstLeg * stepDepth) / 2; // align at pivot
    const y = (firstLeg + j + 0.5) * stepHeight;
    const z = (j + 0.5) * stepDepth - (secondLeg * stepDepth) / 2;
    transforms.push({ position: { x, y, z }, rotationY: Math.PI / 2 });
  }

  return transforms;
}

/**
 * Generate a simple U-shaped stair: split into three legs: up, across, up (mirrored)
 * This generator is simplistic and intended for visualization; production should refine geometry.
 */
export function generateUShapedStairs(
  steps: number,
  stepDepth: number,
  stepHeight: number,
  _width: number
) {
  const transforms: StepTransform[] = [];
  const leg = Math.ceil(steps / 3);
  const leg2 = Math.ceil((steps - leg) / 2);
  const leg3 = steps - leg - leg2;

  // first leg along X
  for (let i = 0; i < leg; i++) {
    const x = (i + 0.5) * stepDepth - (leg * stepDepth) / 2;
    const y = (i + 0.5) * stepHeight;
    transforms.push({ position: { x, y, z: 0 }, rotationY: 0 });
  }

  // middle leg along Z
  for (let j = 0; j < leg2; j++) {
    const x = (leg * stepDepth) / 2;
    const y = (leg + j + 0.5) * stepHeight;
    const z = (j + 0.5) * stepDepth - (leg2 * stepDepth) / 2;
    transforms.push({ position: { x, y, z }, rotationY: Math.PI / 2 });
  }

  // final leg reversed along X
  for (let k = 0; k < leg3; k++) {
    const x = (leg * stepDepth) / 2 - (k + 0.5) * stepDepth;
    const y = (leg + leg2 + k + 0.5) * stepHeight;
    const z = (leg2 * stepDepth) / 2;
    transforms.push({ position: { x, y, z }, rotationY: Math.PI });
  }

  return transforms;
}
