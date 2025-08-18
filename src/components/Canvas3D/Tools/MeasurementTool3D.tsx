import { useDesignStore } from '@/stores/designStore';
import * as THREE from 'three';
import type { Wall, Door, Window } from '@/stores/designStore';

export function MeasurementTool3D() {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const { walls, doors, windows } = useDesignStore(state => ({
    walls: state.walls,
    doors: state.doors,
    windows: state.windows
  })) as { walls: Wall[]; doors: Door[]; windows: Window[] };

  // For now, we'll just show a simple measurement if a wall is selected
  // In a full implementation, this would be more sophisticated

  // Get the selected element
  const selectedElement = (() => {
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
  })();

  // If no wall is selected, don't render
  if (!selectedElement || selectedElementType !== 'wall') return null;

  const wall = selectedElement as Wall;

  // Calculate wall length
  const wallLength = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + 
    Math.pow(wall.end.z - wall.start.z, 2)
  );

  // Calculate midpoint for measurement display
  const midpoint = new THREE.Vector3(
    (wall.start.x + wall.end.x) / 2,
    wall.height + 0.5, // Slightly above the wall
    (wall.start.z + wall.end.z) / 2
  );

  // Calculate wall angle for text orientation
  const wallAngle = Math.atan2(
    wall.end.z - wall.start.z,
    wall.end.x - wall.start.x
  );

  return (
    <group>
      {/* Measurement line */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([
              wall.start.x, wall.height + 0.1, wall.start.z,
              wall.end.x, wall.height + 0.1, wall.end.z
            ])}
            count={2}
            itemSize={3}
            args={[
              new Float32Array([
                wall.start.x, wall.height + 0.1, wall.start.z,
                wall.end.x, wall.height + 0.1, wall.end.z
              ]), 
              3
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="yellow" linewidth={2} />
      </line>

      {/* Measurement text (simplified) */}
      <mesh position={midpoint} rotation={[0, wallAngle, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
}