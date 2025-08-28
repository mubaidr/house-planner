import { useDesignStore } from '@/stores/designStore';
import { calculatePolygonArea, sortPointsToPolygon, wallsToPoints } from '@/utils/math3D';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface RoomCreationToolProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export function RoomCreationTool3D({ isActive, onDeactivate }: RoomCreationToolProps) {
  const walls = useDesignStore(state => state.walls);
  const addRoom = useDesignStore(state => state.addRoom);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gl } = useThree();

  const [selectedWallIds, setSelectedWallIds] = useState<Set<string>>(new Set());
  const [_hoveredWallId, setHoveredWallId] = useState<string | null>(null);

  // Calculate room boundary points from selected walls
  const roomPoints = useMemo(() => {
    const selectedWalls = walls.filter(wall => selectedWallIds.has(wall.id));
    return sortPointsToPolygon(wallsToPoints(selectedWalls));
  }, [walls, selectedWallIds]);

  // Calculate room area
  const roomArea = useMemo(() => {
    return calculatePolygonArea(roomPoints);
  }, [roomPoints]);

  // Handle wall selection
  const handleWallClick = useCallback(
    (wallId: string, event: ThreeEvent<MouseEvent>) => {
      if (!isActive) return;

      event.stopPropagation();

      setSelectedWallIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(wallId)) {
          newSet.delete(wallId);
        } else {
          newSet.add(wallId);
        }
        return newSet;
      });
    },
    [isActive]
  );

  // Handle wall hover
  const handleWallHover = useCallback(
    (wallId: string | null) => {
      if (!isActive) return;
      setHoveredWallId(wallId);
    },
    [isActive]
  );

  // Create room from selected walls
  const _createRoom = useCallback(() => {
    if (selectedWallIds.size === 0) return;

    addRoom({
      wallIds: Array.from(selectedWallIds),
    });

    // Clear selection
    setSelectedWallIds(new Set());
    onDeactivate();
  }, [selectedWallIds, addRoom, roomArea, onDeactivate]);

  // Cancel room creation
  const cancelCreation = useCallback(() => {
    setSelectedWallIds(new Set());
    onDeactivate();
  }, [onDeactivate]);

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        cancelCreation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, cancelCreation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedWallIds(new Set());
      setHoveredWallId(null);
    };
  }, []);

  // Don't render anything if not active
  if (!isActive) return null;

  return (
    <>
      {/* Room boundary preview */}
      {roomPoints.length > 2 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={roomPoints.length + 1}
              array={
                new Float32Array([
                  ...roomPoints.flatMap(p => [p.x, 0.1, p.y]),
                  roomPoints[0].x,
                  0.1,
                  roomPoints[0].y, // Close the loop
                ])
              }
              itemSize={3}
              args={[
                new Float32Array([
                  ...roomPoints.flatMap(p => [p.x, 0.1, p.y]),
                  roomPoints[0].x,
                  0.1,
                  roomPoints[0].y, // Close the loop
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="purple" linewidth={2} />
        </line>
      )}

      {/* Room area label */}
      {roomPoints.length > 2 && (
        <mesh
          position={[
            roomPoints.reduce((sum, p) => sum + p.x, 0) / roomPoints.length,
            0.2,
            roomPoints.reduce((sum, p) => sum + p.y, 0) / roomPoints.length,
          ]}
        >
          <boxGeometry args={[2, 0.1, 0.5]} />
          <meshBasicMaterial color="purple" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Event handlers for walls */}
      {walls.map(wall => (
        <mesh
          key={wall.id}
          position={[
            (wall.start.x + wall.end.x) / 2,
            wall.height / 2,
            (wall.start.z + wall.end.z) / 2,
          ]}
          rotation={[0, -Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x), 0]}
          visible={false}
          onPointerDown={e => handleWallClick(wall.id, e)}
          onPointerEnter={() => handleWallHover(wall.id)}
          onPointerLeave={() => handleWallHover(null)}
        >
          <boxGeometry
            args={[
              Math.sqrt(
                Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
              ),
              wall.height,
              wall.thickness,
            ]}
          />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}

      {/* UI overlay for instructions */}
      <group position={[0, 5, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5, 0.1, 2]} />
          <meshBasicMaterial color="black" transparent opacity={0.7} />
        </mesh>
      </group>
    </>
  );
}
