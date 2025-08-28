import type { Door, Wall, Window } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';
import { useStatusBarStore } from '@/stores/statusBarStore';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

export function MeasurementTool3D() {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);
  const setMeasurement = useStatusBarStore(state => state.setMeasurement);

  const { camera, gl } = useThree();

  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);

  // Handle measurement clicks
  const handleClick = useCallback(
    (event: any) => {
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
        const newPoints = [...measurementPoints, intersection.clone()];

        if (newPoints.length === 2) {
          // Calculate distance between the two points
          const distance = newPoints[0].distanceTo(newPoints[1]);
          setMeasurement(distance);

          // Reset after showing measurement
          setTimeout(() => {
            setMeasurementPoints([]);
            setMeasurement(null);
          }, 3000);
        } else {
          setMeasurementPoints(newPoints);
        }
      }
    },
    [measurementPoints, camera, gl, setMeasurement]
  );

  // Handle escape to cancel measurement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && measurementPoints.length > 0) {
        setMeasurementPoints([]);
        setMeasurement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [measurementPoints, setMeasurement]);

  // Render measurement points and lines
  const measurementElements = useMemo(() => {
    if (measurementPoints.length === 0) return null;

    const elements = [];

    // Add measurement points
    measurementPoints.forEach((point, index) => {
      elements.push(
        <mesh key={`point-${index}`} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      );
    });

    // Add measurement line if we have 2 points
    if (measurementPoints.length === 2) {
      const [start, end] = measurementPoints;
      elements.push(
        <line key="measurement-line">
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([...start.toArray(), ...end.toArray()]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="red" linewidth={2} />
        </line>
      );
    }

    return elements;
  }, [measurementPoints]);

  const selectedElement = useMemo(() => {
    if (!selectedElementId || !selectedElementType) return null;

    switch (selectedElementType) {
      case 'wall':
        return walls.find(w => w.id === selectedElementId);
      case 'door':
        return doors.find(d => d.id === selectedElementId);
      case 'window':
        return windows.find(w => w.id === selectedElementId);
      default:
        return null;
    }
  }, [selectedElementId, selectedElementType, walls, doors, windows]);

  // If no element is selected and no measurement in progress, don't render
  if (!selectedElement && measurementPoints.length === 0) return null;

  return (
    <group>
      {/* Manual measurement elements */}
      {measurementElements}

      {/* Selected element measurements */}
      {selectedElement && selectedElementType && (
        <group>
          {(() => {
            switch (selectedElementType) {
              case 'wall': {
                const wall = selectedElement as Wall;

                // Calculate midpoint for measurement display
                const midpoint = new THREE.Vector3(
                  (wall.start.x + wall.end.x) / 2,
                  wall.height + 0.5,
                  (wall.start.z + wall.end.z) / 2
                );

                // Calculate wall angle for text orientation
                const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

                return (
                  <group>
                    {/* Wall measurement line */}
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array([
                              wall.start.x,
                              wall.height + 0.1,
                              wall.start.z,
                              wall.end.x,
                              wall.height + 0.1,
                              wall.end.z,
                            ]),
                            3,
                          ]}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial color="yellow" linewidth={2} />
                    </line>

                    {/* Wall length measurement */}
                    <mesh position={midpoint} rotation={[0, wallAngle, 0]}>
                      <boxGeometry args={[1, 0.1, 0.1]} />
                      <meshBasicMaterial color="yellow" />
                    </mesh>
                  </group>
                );
              }

              case 'door': {
                const door = selectedElement as Door;
                const doorWall = walls.find(w => w.id === door.wallId);

                if (!doorWall) return null;

                // Calculate door position on wall
                const wallLength = Math.sqrt(
                  Math.pow(doorWall.end.x - doorWall.start.x, 2) +
                    Math.pow(doorWall.end.z - doorWall.start.z, 2)
                );

                const positionRatio = door.position / 100;
                const wallAngle = Math.atan2(
                  doorWall.end.z - doorWall.start.z,
                  doorWall.end.x - doorWall.start.x
                );

                const doorPosition = new THREE.Vector3(
                  doorWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
                  door.height / 2,
                  doorWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
                );

                return (
                  <group>
                    {/* Door width measurement */}
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array([
                              doorPosition.x - door.width / 2,
                              doorPosition.y + door.height / 2 + 0.1,
                              doorPosition.z,
                              doorPosition.x + door.width / 2,
                              doorPosition.y + door.height / 2 + 0.1,
                              doorPosition.z,
                            ]),
                            3,
                          ]}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial color="yellow" linewidth={2} />
                    </line>

                    {/* Door height measurement */}
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array([
                              doorPosition.x - door.width / 2,
                              doorPosition.y,
                              doorPosition.z,
                              doorPosition.x - door.width / 2,
                              doorPosition.y + door.height,
                              doorPosition.z,
                            ]),
                            3,
                          ]}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial color="yellow" linewidth={2} />
                    </line>
                  </group>
                );
              }

              case 'window': {
                const windowElement = selectedElement as Window;
                const windowWall = walls.find(w => w.id === windowElement.wallId);

                if (!windowWall) return null;

                // Calculate window position on wall
                const wallLength = Math.sqrt(
                  Math.pow(windowWall.end.x - windowWall.start.x, 2) +
                    Math.pow(windowWall.end.z - windowWall.start.z, 2)
                );

                const positionRatio = windowElement.position / 100;
                const wallAngle = Math.atan2(
                  windowWall.end.z - windowWall.start.z,
                  windowWall.end.x - windowWall.start.x
                );

                const windowPosition = new THREE.Vector3(
                  windowWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
                  windowElement.height / 2,
                  windowWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
                );

                return (
                  <group>
                    {/* Window width measurement */}
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array([
                              windowPosition.x - windowElement.width / 2,
                              windowPosition.y + windowElement.height / 2 + 0.1,
                              windowPosition.z,
                              windowPosition.x + windowElement.width / 2,
                              windowPosition.y + windowElement.height / 2 + 0.1,
                              windowPosition.z,
                            ]),
                            3,
                          ]}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial color="yellow" linewidth={2} />
                    </line>

                    {/* Window height measurement */}
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array([
                              windowPosition.x - windowElement.width / 2,
                              windowPosition.y,
                              windowPosition.z,
                              windowPosition.x - windowElement.width / 2,
                              windowPosition.y + windowElement.height,
                              windowPosition.z,
                            ]),
                            3,
                          ]}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial color="yellow" linewidth={2} />
                    </line>
                  </group>
                );
              }

              default:
                return null;
            }
          })()}
        </group>
      )}

      {/* Invisible plane for measurement clicks */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerDown={handleClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
