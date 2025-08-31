import { useElementContextMenu } from '@/components/UI/ContextMenu';
import { useDesignStore } from '@/stores/designStore';
import { useToolStore } from '@/stores/toolStore';
import { ThreeEvent } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';

interface Window3DProps {
  windowId: string;
}

export function Window3D({ windowId }: Window3DProps) {
  const window = useDesignStore(state => state.windows.find(w => w.id === windowId));
  const walls = useDesignStore(state => state.walls);
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);
  const { show } = useElementContextMenu();
  const [isHovered, setIsHovered] = useState(false);
  const setHoveredElement = useToolStore(state => state.setHoveredElement);

  // Calculate window position on wall
  const windowPosition = useMemo(() => {
    if (!window) return new THREE.Vector3(0, 0, 0);

    const wall = walls.find(w => w.id === window.wallId);
    if (!wall) return new THREE.Vector3(0, 0, 0);

    // Calculate wall length
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
    );

    const positionRatio = window.position / 100;
    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    return new THREE.Vector3(
      wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
      window.height / 2,
      wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
    );
  }, [window, walls]);

  const windowRotation = useMemo(() => {
    if (!window) return new THREE.Euler(0, 0, 0);

    const wall = walls.find(w => w.id === window.wallId);
    if (!wall) return new THREE.Euler(0, 0, 0);

    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);
    return new THREE.Euler(0, wallAngle + Math.PI / 2, 0);
  }, [window, walls]);

  // Handle window selection
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectElement(windowId, 'window');
  };

  const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    show({ event: e, props: { id: windowId, type: 'window' } });
  };

  // If window doesn't exist, don't render
  if (!window) return null;

  const isSelected = selectedElementId === windowId;

  return (
    <group
      position={windowPosition}
      rotation={windowRotation}
      onClick={handleSelect}
      onContextMenu={handleContextMenu}
      onPointerOver={() => {
        setIsHovered(true);
        setHoveredElement(windowId, 'window');
      }}
      onPointerOut={() => {
        setIsHovered(false);
        setHoveredElement(null, null);
      }}
    >
      {/* Window frame */}
      <mesh position={[0, window.height / 2 + 0.01, 0]}>
        <boxGeometry args={[window.width + 0.05, window.height + 0.05, window.thickness + 0.02]} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : isHovered ? '#ca8a04' : '#8B4513'}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Window glass */}
      <mesh position={[0, window.height / 2, 0]}>
        <boxGeometry args={[window.width, window.height, window.thickness]} />
        <meshPhysicalMaterial
          color={isSelected ? '#3b82f6' : '#87CEEB'}
          roughness={0.1}
          metalness={0.0}
          transparent={true}
          opacity={0.3}
          transmission={0.9}
        />
      </mesh>

      {/* Window cross bars */}
      <mesh position={[0, window.height / 2, 0]}>
        <boxGeometry args={[window.width + 0.02, 0.02, window.thickness + 0.02]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, window.height / 2, 0]}>
        <boxGeometry args={[0.02, window.height + 0.02, window.thickness + 0.02]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, window.height / 2, 0]}>
          <boxGeometry args={[window.width + 0.1, window.height + 0.1, window.thickness + 0.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
