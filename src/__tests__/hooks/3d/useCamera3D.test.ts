import { renderHook, act } from '@testing-library/react';
import { useCamera3D } from '@/hooks/3d/useCamera3D';
import * as THREE from 'three';

// Mock Three.js camera
const mockCamera = {
  position: new THREE.Vector3(0, 10, 10),
  lookAt: jest.fn(),
  updateProjectionMatrix: jest.fn(),
  fov: 75,
  aspect: 1,
  near: 0.1,
  far: 1000,
};

// Mock useThree hook from @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: mockCamera,
    size: { width: 800, height: 600 },
  }),
}));

describe('useCamera3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCamera.position.set(0, 10, 10);
    mockCamera.fov = 75;
  });

  it('initializes with default camera settings', () => {
    const { result } = renderHook(() => useCamera3D());
    
    expect(result.current.preset).toBe('default');
    expect(result.current.isAnimating).toBe(false);
  });

  it('provides camera presets', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const presets = result.current.getPresets();
    expect(presets).toContain('default');
    expect(presets).toContain('top');
    expect(presets).toContain('front');
    expect(presets).toContain('side');
    expect(presets).toContain('isometric');
  });

  it('switches to top view preset', () => {
    const { result } = renderHook(() => useCamera3D());
    
    act(() => {
      result.current.setPreset('top');
    });
    
    expect(result.current.preset).toBe('top');
    expect(result.current.isAnimating).toBe(true);
  });

  it('switches to front view preset', () => {
    const { result } = renderHook(() => useCamera3D());
    
    act(() => {
      result.current.setPreset('front');
    });
    
    expect(result.current.preset).toBe('front');
    expect(result.current.isAnimating).toBe(true);
  });

  it('switches to side view preset', () => {
    const { result } = renderHook(() => useCamera3D());
    
    act(() => {
      result.current.setPreset('side');
    });
    
    expect(result.current.preset).toBe('side');
    expect(result.current.isAnimating).toBe(true);
  });

  it('switches to isometric view preset', () => {
    const { result } = renderHook(() => useCamera3D());
    
    act(() => {
      result.current.setPreset('isometric');
    });
    
    expect(result.current.preset).toBe('isometric');
    expect(result.current.isAnimating).toBe(true);
  });

  it('focuses on a specific point', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const targetPoint = new THREE.Vector3(5, 0, 5);
    
    act(() => {
      result.current.focusOn(targetPoint);
    });
    
    expect(result.current.isAnimating).toBe(true);
    expect(mockCamera.lookAt).toHaveBeenCalledWith(targetPoint);
  });

  it('adjusts field of view', () => {
    const { result } = renderHook(() => useCamera3D());
    
    act(() => {
      result.current.setFieldOfView(90);
    });
    
    expect(mockCamera.fov).toBe(90);
    expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
  });

  it('resets to default view', () => {
    const { result } = renderHook(() => useCamera3D());
    
    // First change to a different preset
    act(() => {
      result.current.setPreset('top');
    });
    
    // Then reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.preset).toBe('default');
    expect(result.current.isAnimating).toBe(true);
  });

  it('gets current camera position', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const position = result.current.getPosition();
    expect(position.x).toBe(0);
    expect(position.y).toBe(10);
    expect(position.z).toBe(10);
  });

  it('sets custom camera position', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const newPosition = new THREE.Vector3(5, 15, 5);
    
    act(() => {
      result.current.setPosition(newPosition);
    });
    
    expect(mockCamera.position.x).toBe(5);
    expect(mockCamera.position.y).toBe(15);
    expect(mockCamera.position.z).toBe(5);
  });

  it('animates camera transitions smoothly', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useCamera3D());
    
    act(() => {
      result.current.setPreset('top');
    });
    
    expect(result.current.isAnimating).toBe(true);
    
    // Fast-forward animation
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.isAnimating).toBe(false);
    
    jest.useRealTimers();
  });

  it('provides camera distance calculation', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const target = new THREE.Vector3(0, 0, 0);
    const distance = result.current.getDistanceToTarget(target);
    
    // Distance from (0,10,10) to (0,0,0) should be sqrt(200) ≈ 14.14
    expect(distance).toBeCloseTo(14.14, 1);
  });

  it('handles zoom in operation', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const initialDistance = result.current.getDistanceToTarget(new THREE.Vector3(0, 0, 0));
    
    act(() => {
      result.current.zoomIn();
    });
    
    const newDistance = result.current.getDistanceToTarget(new THREE.Vector3(0, 0, 0));
    expect(newDistance).toBeLessThan(initialDistance);
  });

  it('handles zoom out operation', () => {
    const { result } = renderHook(() => useCamera3D());
    
    const initialDistance = result.current.getDistanceToTarget(new THREE.Vector3(0, 0, 0));
    
    act(() => {
      result.current.zoomOut();
    });
    
    const newDistance = result.current.getDistanceToTarget(new THREE.Vector3(0, 0, 0));
    expect(newDistance).toBeGreaterThan(initialDistance);
  });
});