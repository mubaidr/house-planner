// jest.setup.js
require('jest-canvas-mock');
require('@testing-library/jest-dom');

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
