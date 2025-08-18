import { useDesignStore } from '@/stores/designStore';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Wall, Door, Window } from '@/stores/designStore';

export function SelectionGizmo3D() {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const { walls, doors, windows } = useDesignStore(state => ({
    walls: state.walls,
    doors: state.doors,
    windows: state.windows
  })) as { walls: Wall[]; doors: Door[]; windows: Window[] };

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

  // If no element is selected, don't render
  if (!selectedElement || !selectedElementType) return null;

  // Calculate position for the gizmo
  let position = new THREE.Vector3(0, 0, 0);
  
  switch (selectedElementType) {
    case 'wall':
      const wall = selectedElement as Wall;
      position = new THREE.Vector3(
        (wall.start.x + wall.end.x) / 2,
        wall.height / 2,
        (wall.start.z + wall.end.z) / 2
      );
      break;
      
    case 'door':
      const door = selectedElement as Door;
      const doorWall = walls.find(w => w.id === door.wallId);
      if (doorWall) {
        const wallLength = Math.sqrt(
          Math.pow(doorWall.end.x - doorWall.start.x, 2) + 
          Math.pow(doorWall.end.z - doorWall.start.z, 2)
        );
        
        const positionRatio = door.position / 100;
        const wallAngle = Math.atan2(
          doorWall.end.z - doorWall.start.z, 
          doorWall.end.x - doorWall.start.x
        );
        
        position = new THREE.Vector3(
          doorWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
          door.height / 2,
          doorWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
        );
      }
      break;
      
    case 'window':
      const windowElement = selectedElement as Window;
      const windowWall = walls.find(w => w.id === windowElement.wallId);
      if (windowWall) {
        const wallLength = Math.sqrt(
          Math.pow(windowWall.end.x - windowWall.start.x, 2) + 
          Math.pow(windowWall.end.z - windowWall.start.z, 2)
        );
        
        const positionRatio = windowElement.position / 100;
        const wallAngle = Math.atan2(
          windowWall.end.z - windowWall.start.z, 
          windowWall.end.x - windowWall.start.x
        );
        
        position = new THREE.Vector3(
          windowWall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
          windowElement.height / 2,
          windowWall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
        );
      }
      break;
  }

  return (
    <group position={position}>
      {/* X axis - red */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshBasicMaterial color="red" />
      </mesh>
      
      {/* Y axis - green */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshBasicMaterial color="green" />
      </mesh>
      
      {/* Z axis - blue */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[0.05, 0.05, 1]} />
        <meshBasicMaterial color="blue" />
      </mesh>
      
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
}