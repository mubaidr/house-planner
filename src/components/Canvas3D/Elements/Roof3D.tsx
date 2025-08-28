import { useDesignStore } from '@/stores/designStore';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Roof3DProps {
  roofId: string;
}

interface Roof3DProps {
  roofId: string;
}

export function Roof3D({ roofId }: Roof3DProps) {
  const roof = useDesignStore(state => state.roofs.find(r => r.id === roofId));
  const walls = useDesignStore(state => state.walls);
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);

  // Calculate roof geometry from walls
  const roofGeometry = useMemo(() => {
    if (!roof || roof.wallIds.length < 3) return null;

    // Get the walls that define this roof
    const roofWalls = walls.filter(wall => roof.wallIds.includes(wall.id));
    if (roofWalls.length < 3) return null;

    // Extract wall endpoints to create roof footprint
    const points: THREE.Vector2[] = [];
    const processedWalls = new Set<string>();

    // Start with the first wall
    const firstWall = roofWalls[0];
    points.push(new THREE.Vector2(firstWall.start.x, firstWall.start.z));
    points.push(new THREE.Vector2(firstWall.end.x, firstWall.end.z));
    processedWalls.add(firstWall.id);

    // Find connected walls to create a closed shape
    let currentEnd = new THREE.Vector2(firstWall.end.x, firstWall.end.z);
    let maxIterations = roofWalls.length * 2; // Prevent infinite loops
    let iterations = 0;

    while (points.length < roofWalls.length * 2 && iterations < maxIterations) {
      let foundConnection = false;

      for (const wall of roofWalls) {
        if (processedWalls.has(wall.id)) continue;

        const wallStart = new THREE.Vector2(wall.start.x, wall.start.z);
        const wallEnd = new THREE.Vector2(wall.end.x, wall.end.z);

        // Check if this wall connects to current end
        if (wallStart.distanceTo(currentEnd) < 0.01) {
          points.push(wallEnd);
          currentEnd = wallEnd;
          processedWalls.add(wall.id);
          foundConnection = true;
          break;
        } else if (wallEnd.distanceTo(currentEnd) < 0.01) {
          points.push(wallStart);
          currentEnd = wallStart;
          processedWalls.add(wall.id);
          foundConnection = true;
          break;
        }
      }

      if (!foundConnection) break;
      iterations++;
    }

    if (points.length < 3) return null;

    // Create shape from wall points
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }

    shape.closePath();

    // Create geometry based on roof type
    let geometry: THREE.BufferGeometry;

    switch (roof.type) {
      case 'flat':
        geometry = new THREE.ShapeGeometry(shape);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(0, roof.height, 0);
        break;

      case 'pitched':
        // Create a simple pitched roof (gable)
        const extrudeSettings = {
          depth: roof.height,
          bevelEnabled: false,
        };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);
        break;

      default:
        // Default to flat roof
        geometry = new THREE.ShapeGeometry(shape);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(0, roof.height, 0);
    }

    return geometry;
  }, [roof, walls]);

  // If roof doesn't exist, don't render
  if (!roof) return null;

  // Handle roof selection
  const handleSelect = (e: any) => {
    e.stopPropagation();
    selectElement(roofId, 'roof');
  };

  // Check if roof is selected
  const isSelected = selectedElementId === roofId;

  return (
    <group onClick={handleSelect}>
      {/* Roof */}
      {roofGeometry && (
        <mesh
          geometry={roofGeometry}
          position={[0, roof.height, 0]} // Position at roof height
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshStandardMaterial
            color={isSelected ? '#3b82f6' : '#8B4513'}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Selection highlight */}
      {isSelected && roofGeometry && (
        <mesh
          geometry={roofGeometry}
          position={[0, roof.height + 0.01, 0]} // Slightly above roof
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
        >
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
