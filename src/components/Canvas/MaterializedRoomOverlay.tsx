'use client';

import React, { useEffect } from 'react';
import { Group, Line, Circle } from 'react-konva';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useMaterialStore } from '@/stores/materialStore';
import { detectRooms } from '@/utils/roomDetection';
import RoomEditor from './RoomEditor';

export default function MaterializedRoomOverlay() {
  const { walls, rooms, updateRooms, updateRoom, selectElement, selectedElementId, selectedElementType } = useDesignStore();
  const { showRooms } = useUIStore();
  const { getMaterialById } = useMaterialStore();

  const { rooms: detectedRooms } = detectRooms(walls);

  // Update rooms when walls change, preserving custom properties
  useEffect(() => {
    const updatedRooms = detectedRooms.map(detectedRoom => {
      const existingRoom = rooms.find((r: any) =>
        r.walls.length === detectedRoom.walls.length &&
        r.walls.every((wallId: any) => detectedRoom.walls.includes(wallId))
      );

      if (existingRoom) {
        // Preserve custom properties but update calculated ones
        return {
          ...existingRoom,
          vertices: detectedRoom.vertices,
          area: detectedRoom.area,
          perimeter: detectedRoom.perimeter,
          center: detectedRoom.center,
          walls: detectedRoom.walls,
        };
      }

      return {
        ...detectedRoom,
        roomType: 'other',
        isCustomNamed: false,
      };
    });

    // Only update if the rooms have actually changed
    const roomsChanged = updatedRooms.length !== rooms.length ||
      updatedRooms.some((room, index) => {
        const existingRoom = rooms[index];
        return !existingRoom ||
          (room.walls && existingRoom.walls && room.walls.length !== existingRoom.walls.length) ||
          (room.walls && existingRoom.walls && room.walls.some((wallId: any) => !existingRoom.walls!.includes(wallId)));
      });

    if (roomsChanged) {
      // Convert detected rooms to proper Room type
      const convertedRooms = updatedRooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        points: room.vertices || room.points || [],
        vertices: room.vertices,
        area: room.area,
        perimeter: room.perimeter,
        center: room.center,
        walls: room.walls,
        material: room.material,
        materialId: room.materialId,
        color: room.color,
        floorId: room.floorId,
        roomType: room.roomType,
        isCustomNamed: room.isCustomNamed
      }));
      updateRooms(convertedRooms);
    }
  }, [walls, updateRooms, detectedRooms, rooms]);

  if (!showRooms || rooms.length === 0) return null;

  return (
    <Group>
      {rooms.map((room: any) => {
        const material = room.materialId ? getMaterialById(room.materialId) : null;

        // Get room appearance based on material or fallback
        const getRoomAppearance = () => {
          if (material) {
            return {
              fill: material.color,
              opacity: material.properties.opacity * 0.3, // Rooms should be more transparent
              stroke: material.color.replace('F2FD', '90A4'),
              fillPatternImage: material.textureImage ? (() => {
                const img = new Image();
                img.src = material.textureImage;
                return img;
              })() : undefined,
              fillPatternScale: material.textureImage ? {
                x: (material.properties.patternScale || 1) * 0.5, // Smaller pattern for rooms
                y: (material.properties.patternScale || 1) * 0.5,
              } : undefined,
              fillPatternRotation: material.textureImage ? (material.properties.patternRotation || 0) : undefined,
            };
          }

          return {
            fill: room.color,
            opacity: 0.2,
            stroke: room.color.replace('F2FD', '90A4'),
          };
        };

        const appearance = getRoomAppearance();

        return (
          <Group key={room.id}>
            {/* Room fill with material */}
            <Line
              points={room.vertices.flatMap((v: any) => [v.x, v.y])}
              closed={true}
              {...appearance}
              listening={false}
            />

            {/* Room border */}
            <Line
              points={room.vertices.flatMap((v: any) => [v.x, v.y])}
              closed={true}
              stroke={appearance.stroke}
              strokeWidth={selectedElementId === room.id && selectedElementType === 'room' ? 3 : 2}
              dash={[5, 5]}
              opacity={0.6}
              listening={false}
            />

            {/* Material effects for rooms */}
            {material && material.properties.metallic > 0.3 && (
              <Line
                points={room.vertices.flatMap((v: any) => [v.x, v.y])}
                closed={true}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1}
                opacity={material.properties.metallic * 0.3}
                listening={false}
              />
            )}

            {/* Room center point */}
            <Circle
              x={room.center.x}
              y={room.center.y}
              radius={selectedElementId === room.id && selectedElementType === 'room' ? 5 : 3}
              fill={material ? material.color.replace('F2FD', '1976') : room.color.replace('F2FD', '1976')}
              opacity={0.8}
              listening={false}
            />

            {/* Interactive Room Editor */}
            <RoomEditor
              room={room}
              isSelected={selectedElementId === room.id && selectedElementType === 'room'}
              onSelect={() => selectElement(room.id, 'room')}
              onEdit={updateRoom}
            />
          </Group>
        );
      })}
    </Group>
  );
}
