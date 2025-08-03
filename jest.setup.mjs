// jest.setup.js
require('jest-canvas-mock');
require('@testing-library/jest-dom');

// Mock Three.js
jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x,
    y,
    z,
    clone: jest.fn().mockReturnValue({ x, y, z }),
    copy: jest.fn(),
    set: jest.fn(),
    add: jest.fn(),
    sub: jest.fn(),
    multiply: jest.fn(),
    divide: jest.fn(),
    normalize: jest.fn().mockReturnValue({ x, y, z }),
    length: jest.fn().mockReturnValue(Math.sqrt(x * x + y * y + z * z)),
    distanceTo: jest.fn((other) => {
      const dx = x - other.x;
      const dy = y - other.y;
      const dz = z - other.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }),
    lerp: jest.fn((target, alpha) => ({
      x: x + (target.x - x) * alpha,
      y: y + (target.y - y) * alpha,
      z: z + (target.z - z) * alpha
    })),
    cross: jest.fn((v) => ({
      x: y * v.z - z * v.y,
      y: z * v.x - x * v.z,
      z: x * v.y - y * v.x
    })),
    dot: jest.fn((v) => x * v.x + y * v.y + z * v.z),
  })),
  Matrix4: jest.fn().mockImplementation(() => ({
    lookAt: jest.fn(),
    makeTranslation: jest.fn(),
    makeRotationFromEuler: jest.fn(),
    makeScale: jest.fn(),
    multiply: jest.fn(),
  })),
  Box3: jest.fn().mockImplementation(() => ({
    setFromObject: jest.fn(),
    union: jest.fn(),
    getCenter: jest.fn(),
    getSize: jest.fn(),
  })),
  Object3D: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    add: jest.fn(),
    remove: jest.fn(),
    traverse: jest.fn(),
  })),
  // Phase 2 Geometry Mocks
  BoxGeometry: jest.fn().mockImplementation((width, height, depth) => ({
    type: 'BoxGeometry',
    parameters: { width, height, depth },
    width,
    height,
    depth,
    clone: jest.fn().mockReturnValue({
      type: 'BoxGeometry',
      parameters: { width, height, depth },
      width,
      height,
      depth,
    }),
  })),
  PlaneGeometry: jest.fn().mockImplementation((width, height) => ({
    type: 'PlaneGeometry',
    parameters: { width, height },
    width,
    height,
    rotateX: jest.fn(),
    clone: jest.fn().mockReturnValue({
      type: 'PlaneGeometry',
      parameters: { width, height },
      width,
      height,
      rotateX: jest.fn(),
    }),
  })),
  ExtrudeGeometry: jest.fn().mockImplementation((shapes, options) => ({
    type: 'ExtrudeGeometry',
    parameters: { shapes, options },
    rotateX: jest.fn(),
    clone: jest.fn().mockReturnValue({
      type: 'ExtrudeGeometry',
      parameters: { shapes, options },
      rotateX: jest.fn(),
    }),
  })),
  ShapeGeometry: jest.fn().mockImplementation((shapes) => ({
    type: 'ShapeGeometry',
    parameters: { shapes },
    rotateX: jest.fn(),
    clone: jest.fn().mockReturnValue({
      type: 'ShapeGeometry',
      parameters: { shapes },
      rotateX: jest.fn(),
    }),
  })),
  CylinderGeometry: jest.fn().mockImplementation((radiusTop, radiusBottom, height) => ({
    type: 'CylinderGeometry',
    parameters: { radiusTop, radiusBottom, height },
    clone: jest.fn().mockReturnValue({
      type: 'CylinderGeometry',
      parameters: { radiusTop, radiusBottom, height },
    }),
  })),
  Shape: jest.fn().mockImplementation(() => ({
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    holes: [],
  })),
  Path: jest.fn().mockImplementation(() => ({
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
  })),
  // Material Mocks
  MeshStandardMaterial: jest.fn().mockImplementation((props) => ({
    type: 'MeshStandardMaterial',
    ...props,
  })),
  MeshPhysicalMaterial: jest.fn().mockImplementation((props) => ({
    type: 'MeshPhysicalMaterial',
    ...props,
  })),
  MeshBasicMaterial: jest.fn().mockImplementation((props) => ({
    type: 'MeshBasicMaterial',
    ...props,
  })),
}));

// Mock localStorage with actual implementation for tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Also define it globally for Node.js environment
global.localStorage = localStorageMock;

// Mock canvas globally
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    drawImage: jest.fn(),
    createImageData: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    toDataURL: jest.fn(),
  })),
});

// Mock document methods
global.document = {
  ...global.document,
  createElement: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      clearRect: jest.fn(),
    })),
    width: 800,
    height: 600,
    toDataURL: jest.fn(),
  })),
};

// Mock window.URL
global.URL = {
  createObjectURL: jest.fn(() => 'mocked-url'),
  revokeObjectURL: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock pdfMake
jest.mock('pdfmake/build/pdfmake', () => ({
  __esModule: true,
  default: {
    vfs: {},
    createPdf: jest.fn(() => ({
      download: jest.fn(),
      getDataUrl: jest.fn((callback) => callback('data:application/pdf;base64,mock')),
      getBase64: jest.fn((callback) => callback('mock-base64')),
      getBuffer: jest.fn((callback) => callback(Buffer.from('mock-buffer'))),
      open: jest.fn(),
      print: jest.fn(),
    })),
  },
}));

jest.mock('pdfmake/build/vfs_fonts', () => ({
  __esModule: true,
  default: {
    pdfMake: {
      vfs: {
        'Roboto-Regular.ttf': 'mock-font-data',
        'Roboto-Medium.ttf': 'mock-font-data',
        'Roboto-Italic.ttf': 'mock-font-data',
        'Roboto-MediumItalic.ttf': 'mock-font-data',
      },
    },
  },
}));

// Suppress console.warn for tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('componentWillReceiveProps')) {
    return;
  }
  originalConsoleWarn(...args);
};
