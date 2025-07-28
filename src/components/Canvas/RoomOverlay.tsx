'use client';

import React, { useEffect } from 'react';
import { Group, Line, Circle } from 'react-konva';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { detectRooms } from '@/utils/roomDetection';
import RoomEditor from './RoomEditor';

export default function RoomOverlay() {
  const { walls, rooms, updateRooms, updateRoom, selectElement, selectedElementId, selectedElementType } = useDesignStore();
  const { showRooms } = useUIStore();
  
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
    
    updateRooms(updatedRooms);
  }, [walls, detectedRooms, updateRooms, rooms]);

  if (!showRooms || rooms.length === 0) return null;

  return (
    <Group>
      {rooms.map((room: any) => (
        <Group key={room.id}>
          {/* Room fill */}
          <Line
            points={room.vertices.flatMap((v: any) => [v.x, v.y])}
            closed={true}
            fill={room.color}
            opacity={0.2}
            listening={false}
          />
          
          {/* Room border */}
          <Line
            points={room.vertices.flatMap((v: any) => [v.x, v.y])}
            closed={true}
            stroke={room.color.replace('F2FD', '90A4')} // Darker version
            strokeWidth={selectedElementId === room.id && selectedElementType === 'room' ? 3 : 2}
            dash={[5, 5]}
            opacity={0.6}
            listening={false}
          />
          
          {/* Room center point */}
          <Circle
            x={room.center.x}
            y={room.center.y}
            radius={selectedElementId === room.id && selectedElementType === 'room' ? 5 : 3}
            fill={room.color.replace('F2FD', '1976')} // Much darker version
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
      ))}
    </Group>
  );
}