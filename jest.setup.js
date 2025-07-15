// jest.setup.js
require('jest-canvas-mock');

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

// Suppress console.warn for tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('componentWillReceiveProps')) {
    return;
  }
  originalConsoleWarn(...args);
};
