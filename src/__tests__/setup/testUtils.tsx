import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';

// Mock React Three Fiber Canvas for testing
export const MockCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-canvas">{children}</div>;
};

// Custom render function for 3D components
export const render3D = (ui: React.ReactElement, options?: RenderOptions) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockCanvas>{children}</MockCanvas>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock Three.js objects for testing
export const mockVector3 = (x = 0, y = 0, z = 0) => ({
  x,
  y,
  z,
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => mockVector3(x, y, z)),
  add: jest.fn(),
  sub: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  normalize: jest.fn(),
  length: jest.fn(() => Math.sqrt(x * x + y * y + z * z)),
  distanceTo: jest.fn((other: any) => 
    Math.sqrt((x - other.x) ** 2 + (y - other.y) ** 2 + (z - other.z) ** 2)
  ),
});

export const mockEuler = (x = 0, y = 0, z = 0) => ({
  x,
  y,
  z,
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => mockEuler(x, y, z)),
});

export const mockGeometry = () => ({
  dispose: jest.fn(),
  attributes: {},
  index: null,
});

export const mockMaterial = () => ({
  dispose: jest.fn(),
  color: { set: jest.fn() },
  roughness: 0.5,
  metalness: 0.1,
});

// Mock store selectors for consistent testing
export const createMockStoreSelector = <T,>(defaultState: T) => {
  return jest.fn((selector: (state: T) => any) => {
    if (typeof selector === 'function') {
      return selector(defaultState);
    }
    return defaultState;
  });
};

// Common test props
export const defaultTestProps = {
  theme: 'dark' as const,
  className: '',
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { render3D as render };