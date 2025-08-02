import * as THREE from 'three';

/**
 * Camera preset configurations
 */
export const CAMERA_PRESETS = {
  perspective: { position: [10, 10, 10] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  top: { position: [0, 20, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  front: { position: [0, 5, 15] as [number, number, number], target: [0, 5, 0] as [number, number, number] },
  back: { position: [0, 5, -15] as [number, number, number], target: [0, 5, 0] as [number, number, number] },
  left: { position: [-15, 5, 0] as [number, number, number], target: [0, 5, 0] as [number, number, number] },
  right: { position: [15, 5, 0] as [number, number, number], target: [0, 5, 0] as [number, number, number] },
  isometric: { position: [12, 12, 12] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
};

/**
 * Calculate optimal camera position to frame all objects
 */
export function calculateOptimalCameraPosition(
  objects: THREE.Object3D[],
  _aspectRatio: number = 1
): { position: [number, number, number]; target: [number, number, number] } {
  if (objects.length === 0) {
    return CAMERA_PRESETS.perspective;
  }

  // Calculate bounding box of all objects
  const box = new THREE.Box3();
  objects.forEach(obj => {
    const objBox = new THREE.Box3().setFromObject(obj);
    box.union(objBox);
  });

  // Handle empty/invalid bounding box
  if (box.isEmpty()) {
    return CAMERA_PRESETS.perspective;
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Handle zero-size objects
  if (maxDim === 0) {
    return {
      position: [center.x + 10, center.y + 10, center.z + 10],
      target: [center.x, center.y, center.z]
    };
  }

  // Calculate camera distance based on FOV and object size
  const fov = 50; // degrees
  const distance = maxDim / (2 * Math.tan((fov * Math.PI) / 360));

  // Position camera at an angle for good perspective
  const cameraPosition: [number, number, number] = [
    center.x + distance * 0.7,
    center.y + distance * 0.7,
    center.z + distance * 0.7
  ];

  return {
    position: cameraPosition,
    target: [center.x, center.y, center.z]
  };
}

/**
 * Smooth camera transition between two positions
 */
export function interpolateCameraPosition(
  start: { position: [number, number, number]; target: [number, number, number] },
  end: { position: [number, number, number]; target: [number, number, number] },
  t: number
): { position: [number, number, number]; target: [number, number, number] } {
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    position: [
      start.position[0] + (end.position[0] - start.position[0]) * clampedT,
      start.position[1] + (end.position[1] - start.position[1]) * clampedT,
      start.position[2] + (end.position[2] - start.position[2]) * clampedT,
    ],
    target: [
      start.target[0] + (end.target[0] - start.target[0]) * clampedT,
      start.target[1] + (end.target[1] - start.target[1]) * clampedT,
      start.target[2] + (end.target[2] - start.target[2]) * clampedT,
    ]
  };
}

/**
 * Convert spherical coordinates to cartesian
 */
export function sphericalToCartesian(
  radius: number,
  theta: number, // azimuth angle in radians
  phi: number    // polar angle in radians
): [number, number, number] {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

/**
 * Convert cartesian coordinates to spherical
 */
export function cartesianToSpherical(
  x: number,
  y: number,
  z: number
): { radius: number; theta: number; phi: number } {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.atan2(z, x);
  const phi = Math.acos(y / radius);
  return { radius, theta, phi };
}

/**
 * Check if camera position is valid (not too close, not NaN, etc.)
 */
export function validateCameraPosition(position: [number, number, number]): boolean {
  return (
    position.length === 3 &&
    position.every(coord => typeof coord === 'number' && !isNaN(coord) && isFinite(coord)) &&
    Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2) >= 0.1 // Not too close to origin
  );
}

/**
 * Calculate camera look-at matrix
 */
export function calculateLookAtMatrix(
  position: [number, number, number],
  target: [number, number, number],
  up: [number, number, number] = [0, 1, 0]
): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  const eye = new THREE.Vector3(...position);
  const center = new THREE.Vector3(...target);
  const upVector = new THREE.Vector3(...up);

  matrix.lookAt(eye, center, upVector);
  return matrix;
}
