import { renderHook } from '@testing-library/react';
import { useConstraints } from '@/hooks/useConstraints';
import * as THREE from 'three';

describe('useConstraints', () => {
  it('initializes with default constraint settings', () => {
    const { result } = renderHook(() => useConstraints());
    
    expect(result.current.snapToGrid).toBe(true);
    expect(result.current.snapToEndpoints).toBe(true);
    expect(result.current.snapToMidpoints).toBe(true);
    expect(result.current.snapToIntersections).toBe(true);
    expect(result.current.gridSpacing).toBe(1);
    expect(result.current.snapTolerance).toBe(0.5);
  });

  it('applies grid snapping correctly', () => {
    const { result } = renderHook(() => useConstraints());
    
    const point = new THREE.Vector3(1.3, 0, 2.7);
    const snappedPoint = result.current.applyGridSnap(point);
    
    expect(snappedPoint.x).toBe(1);
    expect(snappedPoint.z).toBe(3);
    expect(snappedPoint.y).toBe(0);
  });

  it('applies grid snapping with custom spacing', () => {
    const { result } = renderHook(() => useConstraints());
    
    result.current.setGridSpacing(0.5);
    
    const point = new THREE.Vector3(1.3, 0, 2.7);
    const snappedPoint = result.current.applyGridSnap(point);
    
    expect(snappedPoint.x).toBe(1.5);
    expect(snappedPoint.z).toBe(2.5);
  });

  it('skips grid snapping when disabled', () => {
    const { result } = renderHook(() => useConstraints());
    
    result.current.setSnapToGrid(false);
    
    const point = new THREE.Vector3(1.3, 0, 2.7);
    const snappedPoint = result.current.applyGridSnap(point);
    
    expect(snappedPoint.x).toBe(1.3);
    expect(snappedPoint.z).toBe(2.7);
  });

  it('finds nearest endpoint within tolerance', () => {
    const { result } = renderHook(() => useConstraints());
    
    const walls = [
      {
        id: 'wall-1',
        start: { x: 0, y: 0, z: 0 },
        end: { x: 5, y: 0, z: 0 },
      },
      {
        id: 'wall-2',
        start: { x: 5, y: 0, z: 0 },
        end: { x: 5, y: 0, z: 5 },
      },
    ];
    
    const point = new THREE.Vector3(0.2, 0, 0.1);
    const snappedPoint = result.current.applyEndpointSnap(point, walls);
    
    expect(snappedPoint.x).toBe(0);
    expect(snappedPoint.z).toBe(0);
  });

  it('does not snap to endpoint outside tolerance', () => {
    const { result } = renderHook(() => useConstraints());
    
    const walls = [
      {
        id: 'wall-1',
        start: { x: 0, y: 0, z: 0 },
        end: { x: 5, y: 0, z: 0 },
      },
    ];
    
    const point = new THREE.Vector3(1, 0, 1);
    const snappedPoint = result.current.applyEndpointSnap(point, walls);
    
    expect(snappedPoint.x).toBe(1);
    expect(snappedPoint.z).toBe(1);
  });

  it('finds midpoint correctly', () => {
    const { result } = renderHook(() => useConstraints());
    
    const walls = [
      {
        id: 'wall-1',
        start: { x: 0, y: 0, z: 0 },
        end: { x: 4, y: 0, z: 0 },
      },
    ];
    
    const point = new THREE.Vector3(2.1, 0, 0.1);
    const snappedPoint = result.current.applyMidpointSnap(point, walls);
    
    expect(snappedPoint.x).toBe(2);
    expect(snappedPoint.z).toBe(0);
  });

  it('applies angle constraints correctly', () => {
    const { result } = renderHook(() => useConstraints());
    
    const startPoint = new THREE.Vector3(0, 0, 0);
    const endPoint = new THREE.Vector3(1, 0, 1); // 45 degrees
    
    const constrainedPoint = result.current.applyAngleConstraint(startPoint, endPoint);
    
    // Should snap to nearest 15-degree increment (45 degrees is already aligned)
    expect(constrainedPoint.x).toBeCloseTo(1, 5);
    expect(constrainedPoint.z).toBeCloseTo(1, 5);
  });

  it('constrains to horizontal line', () => {
    const { result } = renderHook(() => useConstraints());
    
    const startPoint = new THREE.Vector3(0, 0, 0);
    const endPoint = new THREE.Vector3(1, 0, 0.1); // Nearly horizontal
    
    const constrainedPoint = result.current.applyAngleConstraint(startPoint, endPoint);
    
    expect(constrainedPoint.x).toBeCloseTo(1, 5);
    expect(constrainedPoint.z).toBeCloseTo(0, 5);
  });

  it('constrains to vertical line', () => {
    const { result } = renderHook(() => useConstraints());
    
    const startPoint = new THREE.Vector3(0, 0, 0);
    const endPoint = new THREE.Vector3(0.1, 0, 1); // Nearly vertical
    
    const constrainedPoint = result.current.applyAngleConstraint(startPoint, endPoint);
    
    expect(constrainedPoint.x).toBeCloseTo(0, 5);
    expect(constrainedPoint.z).toBeCloseTo(1, 5);
  });

  it('updates snap tolerance', () => {
    const { result } = renderHook(() => useConstraints());
    
    result.current.setSnapTolerance(1.0);
    expect(result.current.snapTolerance).toBe(1.0);
  });

  it('toggles constraint settings', () => {
    const { result } = renderHook(() => useConstraints());
    
    result.current.setSnapToEndpoints(false);
    expect(result.current.snapToEndpoints).toBe(false);
    
    result.current.setSnapToMidpoints(false);
    expect(result.current.snapToMidpoints).toBe(false);
    
    result.current.setSnapToIntersections(false);
    expect(result.current.snapToIntersections).toBe(false);
  });
});