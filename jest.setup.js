// Setup file for Jest tests using CommonJS
require('@testing-library/jest-dom/jest-globals');

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: {
      position: { x: 0, y: 10, z: 10 },
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
      fov: 75,
    },
    scene: {},
    gl: {},
    size: { width: 800, height: 600 },
  })),
  extend: jest.fn(),
}));

// Mock React Three Drei
jest.mock('@react-three/drei', () => ({
  Grid: () => React.createElement('mesh', { 'data-testid': 'grid' }),
  OrbitControls: () => React.createElement('group', { 'data-testid': 'orbit-controls' }),
  Stats: () => React.createElement('div', { 'data-testid': 'stats' }),
  Text: ({ children }) => React.createElement('mesh', { 'data-testid': 'text' }, children),
  Html: ({ children }) => React.createElement('div', { 'data-testid': 'html' }, children),
}));

// Mock window functions
global.confirm = jest.fn(() => true);
global.alert = jest.fn();
require('jest-canvas-mock');

// Mock DOM APIs not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(callback => {
  return setTimeout(callback, 0);
});

global.cancelAnimationFrame = jest.fn().mockImplementation(id => {
  clearTimeout(id);
});

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      drawImage: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 }))
    };
  }
  return null;
});
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  callback(new Blob(['mock canvas data'], { type: 'image/png' }));
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock createImageBitmap
global.createImageBitmap = jest.fn().mockResolvedValue({
  close: jest.fn(),
});

// Mock Blob
global.Blob = class Blob {
  constructor(bits = [], options = {}) {
    this.size = bits.length;
    this.type = options.type || '';
  }
};

// Mock File
global.File = class File extends Blob {
  constructor(bits, name, options = {}) {
    super(bits, options);
    this.name = name;
  }
};

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'mock-url');
URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  blob: jest.fn().mockResolvedValue(new Blob()),
});

// Mock AbortController
global.AbortController = class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }
  abort() {}
};

// Mock AbortSignal
global.AbortSignal = class AbortSignal {
  constructor() {
    this.aborted = false;
  }
  static abort() {
    return new AbortSignal();
  }
  static timeout(ms) {
    return new AbortSignal();
  }
};

// Mock HTMLImageElement
global.HTMLImageElement = class HTMLImageElement {
  constructor() {
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.complete = false;
  }
};

// Mock HTMLVideoElement
global.HTMLVideoElement = class HTMLVideoElement {
  constructor() {
    this.videoWidth = 0;
    this.videoHeight = 0;
  }
};

// Mock VideoFrame
global.VideoFrame = class VideoFrame {
  constructor() {}
  close() {}
};

// Mock ImageBitmap
global.ImageBitmap = class ImageBitmap {
  constructor() {}
  close() {}
};

// Mock OffscreenCanvas
global.OffscreenCanvas = class OffscreenCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  getContext() {
    return null;
  }
  transferToImageBitmap() {
    return new ImageBitmap();
  }
};

// Mock document methods
Document.prototype.createElementNS = jest.fn((namespaceURI, qualifiedName) => {
  if (qualifiedName === 'canvas') {
    return new HTMLCanvasElement();
  }
  return document.createElement(qualifiedName);
});

// Mock console methods to reduce noise in tests
console.warn = jest.fn();
console.error = jest.fn();
console.debug = jest.fn();
console.info = jest.fn();
console.log = jest.fn();

// Mock performance API
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn().mockReturnValue(0),
  },
});

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1,
});
