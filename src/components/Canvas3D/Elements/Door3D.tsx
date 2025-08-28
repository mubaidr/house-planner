import { useElementContextMenu } from '@/components/UI/ContextMenu';
import { useDesignStore } from '@/stores/designStore';
import { useToolStore } from '@/stores/toolStore';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface Door3DProps {
  doorId: string;
}

export function Door3D({ doorId }: Door3DProps) {
  const door = useDesignStore(state => state.doors.find(d => d.id === doorId));
  const wall = useDesignStore(state => state.walls.find(w => w.id === door?.wallId));
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectElement = useDesignStore(state => state.selectElement);
  const { show } = useElementContextMenu();
  const [isHovered, setIsHovered] = useState(false);
  const setHoveredElement = useToolStore(state => state.setHoveredElement);

  const groupRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Mesh>(null);

  // Calculate door position on wall
  const doorPosition = useMemo(() => {
    if (!door || !wall) return new THREE.Vector3(0, 0, 0);

    // Calculate wall length
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
    );

    const positionRatio = door.position / 100;
    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    return new THREE.Vector3(
      wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
      door.height / 2,
      wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
    );
  }, [door, wall]);

  const doorRotation = useMemo(() => {
    if (!wall) return new THREE.Euler(0, 0, 0);

    const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

    return new THREE.Euler(0, wallAngle + Math.PI / 2, 0);
  }, [wall]);

  // Handle door selection
  const handleSelect = (e: any) => {
    e.stopPropagation();
    selectElement(doorId, 'door');
  };

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    show({ event: e, props: { id: doorId, type: 'door' } });
  };

  // Door animation
  useFrame(state => {
    if (!panelRef.current || !door) return;

    const time = state.clock.getElapsedTime();
    const swingAngle = door.isOpen ? door.openAngle * (Math.PI / 180) : 0;
    const animatedAngle = door.isOpen
      ? swingAngle * (1 - Math.exp(-time * 2))
      : swingAngle * Math.exp(-time * 2);

    panelRef.current.rotation.y = animatedAngle;
  });

  // If door doesn't exist, don't render
  if (!door) return null;

  const isSelected = selectedElementId === doorId;

  return (
    <group
      ref={groupRef}
      position={doorPosition}
      rotation={doorRotation}
      onClick={handleSelect}
      onContextMenu={handleContextMenu}
      onPointerOver={() => {
        setIsHovered(true);
        setHoveredElement(doorId, 'door');
      }}
      onPointerOut={() => {
        setIsHovered(false);
        setHoveredElement(null, null);
      }}
    >
      {/* Door frame */}
      <mesh position={[0, door.height / 2 + 0.025, 0]}>
        <boxGeometry args={[door.width + 0.05, door.height + 0.05, door.thickness + 0.02]} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : isHovered ? '#ca8a04' : '#8B4513'}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Door panel */}
      <mesh ref={panelRef} position={[door.width / 2 - door.thickness / 2, door.height / 2, 0]}>
        <boxGeometry args={[door.thickness, door.height, door.width]} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : isHovered ? '#ca8a04' : '#654321'}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[door.thickness / 2 + 0.01, door.height / 2, door.width * 0.2]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, door.height / 2, 0]}>
          <boxGeometry args={[door.width + 0.1, door.height + 0.1, door.thickness + 0.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
