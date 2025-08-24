import { useConstraints } from '@/hooks/useConstraints';
import { useDesignStore } from '@/stores/designStore';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

interface WallDrawingToolProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export function WallDrawingTool3D({ isActive, onDeactivate }: WallDrawingToolProps) {
  const addWall = useDesignStore(state => state.addWall);

  const { applyGridSnap, applyAngleSnap } = useConstraints({
    snapToGrid: true,
    gridSize: 0.1,
    snapToAngle: true,
    angleIncrement: 15,
  });

  const { camera, gl } = useThree();

  const [startPoint, setStartPoint] = useState<THREE.Vector3 | null>(null);
  const [currentPoint, setCurrentPoint] = useState<THREE.Vector3 | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Handle mouse move for drawing preview
  const handleMouseMove = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isDrawing || !startPoint) return;

      // Get the point on the ground plane (y = 0)
      const mouse = new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        // Apply grid snapping
        const snappedPoint = applyGridSnap(intersection);

        // Apply angle snapping relative to start point
        const delta = new THREE.Vector3().subVectors(snappedPoint, startPoint);
        const angle = Math.atan2(delta.z, delta.x);
        const snappedAngle = applyAngleSnap(angle);

        // Calculate new endpoint with snapped angle
        const distance = startPoint.distanceTo(snappedPoint);
        const newEndPoint = new THREE.Vector3(
          startPoint.x + Math.cos(snappedAngle) * distance,
          0,
          startPoint.z + Math.sin(snappedAngle) * distance
        );

        setCurrentPoint(newEndPoint);
      }
    },
    [isDrawing, startPoint, camera, gl, applyGridSnap, applyAngleSnap]
  );

  // Handle mouse down to start drawing
  const handleMouseDown = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isActive) return;

      event.stopPropagation();

      // Get the point on the ground plane (y = 0)
      const mouse = new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const snappedPoint = applyGridSnap(intersection);
        setStartPoint(snappedPoint);
        setCurrentPoint(snappedPoint);
        setIsDrawing(true);
      }
    },
    [isActive, camera, gl, applyGridSnap]
  );

  // Handle mouse up to finish drawing
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPoint || !currentPoint) return;

    // Only create wall if start and end points are different
    if (startPoint.distanceTo(currentPoint) > 0.01) {
      addWall({
        start: { x: startPoint.x, y: 0, z: startPoint.z },
        end: { x: currentPoint.x, y: 0, z: currentPoint.z },
        height: 2.5,
        thickness: 0.2,
        type: 'load-bearing',
      });
    }

    // Reset drawing state
    setStartPoint(null);
    setCurrentPoint(null);
    setIsDrawing(false);

    // Deactivate tool after drawing
    onDeactivate();
  }, [isDrawing, startPoint, currentPoint, addWall, onDeactivate]);

  // Handle escape key to cancel drawing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawing) {
        setStartPoint(null);
        setCurrentPoint(null);
        setIsDrawing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setStartPoint(null);
      setCurrentPoint(null);
      setIsDrawing(false);
    };
  }, []);

  // Don't render anything if not active
  if (!isActive) return null;

  return (
    <>
      {/* Drawing preview line */}
      {isDrawing && startPoint && currentPoint && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={
                new Float32Array([
                  startPoint.x,
                  startPoint.y,
                  startPoint.z,
                  currentPoint.x,
                  currentPoint.y,
                  currentPoint.z,
                ])
              }
              itemSize={3}
              args={[
                new Float32Array([
                  startPoint.x,
                  startPoint.y,
                  startPoint.z,
                  currentPoint.x,
                  currentPoint.y,
                  currentPoint.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="blue" linewidth={2} />
        </line>
      )}

      {/* Event handlers */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerMove={handleMouseMove}
        onPointerDown={handleMouseDown}
        onPointerUp={handleMouseUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
