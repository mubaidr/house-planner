import { useDesignStore } from '@/stores/designStore';
// RectAreaLight is created via three primitives when needed
import { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Window3DProps {
  windowId: string;
}

export function Window3D({ windowId }: Window3DProps) {
  const windowElement = useDesignStore(state => state.windows.find(w => w.id === windowId));
  const wall = useDesignStore(state => state.walls.find(w => w.id === windowElement?.wallId));
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);

  // Calculate window position on wall
  const windowPosition = useMemo(() => {
    if (!windowElement || !wall) return new THREE.Vector3();
    // Calculate wall length
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
    );

    // Calculate position ratio (convert from percentage to 0-1)
    const positionRatio = windowElement.position / 100;

    // Calculate wall angle
    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    // Calculate window position
    const x = wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio;
    const z = wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio;

    // Height position (center of window)
    const y = windowElement.height / 2;

    return new THREE.Vector3(x, y, z);
  }, [windowElement, wall]);

  // Calculate window rotation based on wall angle
  const windowRotation = useMemo(() => {
    if (!wall) return new THREE.Euler();
    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    return new THREE.Euler(0, wallAngle, 0);
  }, [wall]);

  // If window or wall doesn't exist, don't render
  if (!windowElement || !wall) return null;

  // Handle window selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(windowId, 'window');
  };

  // Check if window is selected
  const isSelected = selectedElementId === windowId;

  return (
    <group position={windowPosition} rotation={windowRotation} onClick={handleSelect}>
      {/* Window frame */}
      <mesh>
        <boxGeometry
          args={[
            windowElement.width + 0.1,
            windowElement.height + 0.1,
            windowElement.thickness + 0.05,
          ]}
        />
        <meshStandardMaterial color="#8B4513" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Window glass - multiple panes based on glazing */}
      {(() => {
        const panes =
          windowElement.glazing === 'single' ? 1 : windowElement.glazing === 'double' ? 2 : 3;
        const paneThickness = windowElement.thickness / (panes + 1);
        const spacing = windowElement.thickness / (panes + 1);

        return Array.from({ length: panes }, (_, i) => (
          <mesh key={i} position={[0, 0, (i - (panes - 1) / 2) * spacing]}>
            <boxGeometry args={[windowElement.width, windowElement.height, paneThickness]} />
            <meshStandardMaterial
              color="#87CEEB"
              roughness={0.1}
              metalness={0.0}
              transparent={true}
              opacity={0.3}
            />
          </mesh>
        ));
      })()}

      {(() => {
        const rect = new THREE.RectAreaLight(
          '#FFFFFF',
          5,
          windowElement.width,
          windowElement.height
        );
        rect.position.set(0, windowElement.height / 2, 0.1);
        rect.rotation.set(0, Math.PI, 0);
        return <primitive object={rect} />;
      })()}

      {/* Selection highlight */}
      {isSelected && (
        <mesh>
          <boxGeometry
            args={[
              windowElement.width + 0.15,
              windowElement.height + 0.15,
              windowElement.thickness + 0.1,
            ]}
          />
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
