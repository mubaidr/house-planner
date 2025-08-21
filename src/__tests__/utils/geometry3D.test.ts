import {
  generateLShapedStairs,
  generateStraightStairs,
  generateUShapedStairs,
} from '@/utils/3d/geometry3D';

describe('stair generators', () => {
  test('straight stairs generate correct number of steps', () => {
    const transforms = generateStraightStairs(10, 0.25, 0.17, 1);
    expect(transforms.length).toBe(10);
    expect(transforms[0].position.y).toBeCloseTo(0.085, 3);
  });

  test('L-shaped stairs split steps roughly in two', () => {
    const transforms = generateLShapedStairs(9, 0.25, 0.17, 1);
    expect(transforms.length).toBe(9);
    // ensure a rotation appears (second leg rotated by ~90deg)
    const rotations = transforms.map(t => t.rotationY);
    expect(rotations.some(r => Math.abs(r - Math.PI / 2) < 0.001)).toBe(true);
  });

  test('U-shaped stairs generate expected count and use multiple rotations', () => {
    const transforms = generateUShapedStairs(12, 0.25, 0.17, 1);
    expect(transforms.length).toBe(12);
    const rotations = new Set(transforms.map(t => Math.round(t.rotationY * 100) / 100));
    // should include at least two rotation values (e.g., 0 and ~1.57)
    expect(rotations.size).toBeGreaterThanOrEqual(2);
  });
});
