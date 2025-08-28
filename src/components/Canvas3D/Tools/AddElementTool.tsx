import { useDesignStore } from '@/stores/designStore';
import { useToolStore } from '@/stores/toolStore';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface AddElementToolProps {
  isActive: boolean;
  elementType: 'door' | 'window';
  onDeactivate: () => void;
}

export function AddElementTool({ isActive, elementType, onDeactivate }: AddElementToolProps) {
  const { walls, addDoor, addWindow } = useDesignStore();
  const setHoveredWallId = useToolStore(state => state.setHoveredWallId);

  const handleMouseMove = (event: ThreeEvent<MouseEvent>) => {
    if (!isActive) return;

    const intersection = event.intersections.find(i => i.object.userData.type === 'wall');
    if (intersection) {
      setHoveredWallId(intersection.object.userData.id);
    } else {
      setHoveredWallId(null);
    }
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!isActive) return;

    const intersection = event.intersections.find(i => i.object.userData.type === 'wall');
    if (!intersection) return;

    const wall = walls.find(w => w.id === intersection.object.userData.id);
    if (!wall) return;

    const intersectionPoint = event.point;
    const wallStart = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
    const wallEnd = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);
    const wallLength = wallStart.distanceTo(wallEnd);
    const position = (wallStart.distanceTo(intersectionPoint) / wallLength) * 100;

    if (elementType === 'door') {
      addDoor({
        wallId: wall.id,
        position,
        width: 0.9,
        height: 2.1,
        thickness: 0.1,
        type: 'single',
        swingDirection: 'left',
        isOpen: false,
        openAngle: 0,
        openOffset: 0,
      });
    } else if (elementType === 'window') {
      addWindow({
        wallId: wall.id,
        position,
        width: 1.2,
        height: 1.2,
        thickness: 0.1,
        type: 'single',
        glazing: 'single',
      });
    }

    onDeactivate();
  };

  return (
    <mesh onPointerMove={handleMouseMove} onClick={handleClick} visible={false}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
