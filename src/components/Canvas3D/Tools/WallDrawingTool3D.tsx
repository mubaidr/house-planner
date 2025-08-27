import { useConstraints } from '@/hooks/useConstraints';
import { useDesignStore } from '@/stores/designStore';
import { useStatusBarStore } from '@/stores/statusBarStore';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

interface WallDrawingToolProps {
  isActive: boolean;
  onDeactivate: () => void;
}

const SNAP_DISTANCE = 0.5;

export function WallDrawingTool3D({ isActive, onDeactivate }: WallDrawingToolProps) {
  const { walls, addWall } = useDesignStore(state => ({ walls: state.walls, addWall: state.addWall }));
  const setAngle = useStatusBarStore(state => state.setAngle);

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
  const [snappedAngle, setSnappedAngle] = useState<number | null>(null);
  const [snapPoint, setSnapPoint] = useState<THREE.Vector3 | null>(null);

  const getSnapPoint = useCallback(
    (point: THREE.Vector3): THREE.Vector3 | null => {
      for (const wall of walls) {
        const start = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
        const end = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);
        if (point.distanceTo(start) < SNAP_DISTANCE) return start;
        if (point.distanceTo(end) < SNAP_DISTANCE) return end;
      }
      return null;
    },
    [walls]
  );

  // Handle mouse move for drawing preview
  const handleMouseMove = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isDrawing || !startPoint) return;

      const mouse = new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        let finalPoint = intersection;
        const objectSnapPoint = getSnapPoint(intersection);
        if (objectSnapPoint) {
          finalPoint = objectSnapPoint;
          setSnapPoint(objectSnapPoint);
        } else {
          setSnapPoint(null);
          finalPoint = applyGridSnap(intersection);
        }

        const delta = new THREE.Vector3().subVectors(finalPoint, startPoint);
        const angle = Math.atan2(delta.z, delta.x);
        const newSnappedAngle = applyAngleSnap(angle);
        setSnappedAngle(newSnappedAngle);
        setAngle(THREE.MathUtils.radToDeg(newSnappedAngle));

        const distance = startPoint.distanceTo(finalPoint);
        const newEndPoint = new THREE.Vector3(
          startPoint.x + Math.cos(newSnappedAngle) * distance,
          0,
          startPoint.z + Math.sin(newSnappedAngle) * distance
        );

        setCurrentPoint(newEndPoint);
      }
    },
    [isDrawing, startPoint, camera, gl, applyGridSnap, applyAngleSnap, setAngle, getSnapPoint]
  );

  // Handle mouse down to start drawing
  const handleMouseDown = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isActive) return;

      event.stopPropagation();

      const mouse = new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const objectSnapPoint = getSnapPoint(intersection);
        const snappedPoint = objectSnapPoint || applyGridSnap(intersection);
        setStartPoint(snappedPoint);
        setCurrentPoint(snappedPoint);
        setIsDrawing(true);
      }
    },
    [isActive, camera, gl, applyGridSnap, getSnapPoint]
  );

  // Handle mouse up to finish drawing
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPoint || !currentPoint) return;

    if (startPoint.distanceTo(currentPoint) > 0.01) {
      addWall({
        start: { x: startPoint.x, y: 0, z: startPoint.z },
        end: { x: currentPoint.x, y: 0, z: currentPoint.z },
        height: 2.5,
        thickness: 0.2,
        type: 'load-bearing',
      });
    }

    setStartPoint(null);
    setCurrentPoint(null);
    setIsDrawing(false);
    setSnappedAngle(null);
    setAngle(null);
    setSnapPoint(null);

    onDeactivate();
  }, [isDrawing, startPoint, currentPoint, addWall, onDeactivate, setAngle]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawing) {
        setStartPoint(null);
        setCurrentPoint(null);
        setIsDrawing(false);
        setSnappedAngle(null);
        setAngle(null);
        setSnapPoint(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, setAngle]);

  useEffect(() => {
    return () => {
      setStartPoint(null);
      setCurrentPoint(null);
      setIsDrawing(false);
      setSnappedAngle(null);
      setAngle(null);
      setSnapPoint(null);
    };
  }, [setAngle]);

  if (!isActive) return null;

  return (
    <>
      {isDrawing && startPoint && currentPoint && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...startPoint.toArray(), ...currentPoint.toArray()])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="blue" linewidth={2} />
        </line>
      )}

      {isDrawing && startPoint && snappedAngle !== null && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                startPoint.x,
                startPoint.y,
                startPoint.z,
                startPoint.x + Math.cos(snappedAngle) * 2,
                startPoint.y,
                startPoint.z + Math.sin(snappedAngle) * 2,
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="red" dashed={true} dashSize={0.1} gapSize={0.1} />
        </line>
      )}

      {snapPoint && (
        <mesh position={snapPoint}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="red" transparent opacity={0.5} />
        </mesh>
      )}

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
