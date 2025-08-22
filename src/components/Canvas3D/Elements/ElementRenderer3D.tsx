import { useDesignStore } from '@/stores/designStore';
import { ElementManipulationTool3D } from '../Tools/ElementManipulationTool3D';
import { MeasurementTool3D } from '../Tools/MeasurementTool3D';
import { RoomCreationTool3D } from '../Tools/RoomCreationTool3D';
import { SelectionGizmo3D } from '../Tools/SelectionGizmo3D';
import { WallDrawingTool3D } from '../Tools/WallDrawingTool3D';
import { Door3D } from './Door3D';
import { Roof3D } from './Roof3D';
import { Room3D } from './Room3D';
import { Stair3D } from './Stair3D';
import { Wall3D } from './Wall3D';
import { Window3D } from './Window3D';

export function ElementRenderer3D() {
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);
  const stairs = useDesignStore(state => state.stairs);
  const rooms = useDesignStore(state => state.rooms);
  const roofs = useDesignStore(state => state.roofs);
  const activeTool = useDesignStore(state => state.activeTool);
  const setActiveTool = useDesignStore(state => state.setActiveTool);
  const selectedElementId = useDesignStore(state => state.selectedElementId);

  return (
    <group name="architectural-elements">
      {/* Render rooms first (floors/ceilings) */}
      <group name="rooms">
        {rooms.map(room => (
          <Room3D key={room.id} roomId={room.id} />
        ))}
      </group>

      {/* Render walls */}
      <group name="walls">
        {walls.map(wall => (
          <Wall3D key={wall.id} wallId={wall.id} />
        ))}
      </group>

      {/* Render doors */}
      <group name="doors">
        {doors.map(door => (
          <Door3D key={door.id} doorId={door.id} />
        ))}
      </group>

      {/* Render windows */}
      <group name="windows">
        {windows.map(window => (
          <Window3D key={window.id} windowId={window.id} />
        ))}
      </group>

      {/* Render stairs */}
      <group name="stairs">
        {stairs.map(stair => (
          <Stair3D key={stair.id} stairId={stair.id} />
        ))}
      </group>

      {/* Render roofs */}
      <group name="roofs">
        {roofs.map(roof => (
          <Roof3D key={roof.id} roofId={roof.id} />
        ))}
      </group>

      {/* Wall drawing tool */}
      <WallDrawingTool3D
        isActive={activeTool === 'wall'}
        onDeactivate={() => setActiveTool(null)}
      />

      {/* Room creation tool */}
      <RoomCreationTool3D
        isActive={activeTool === 'room'}
        onDeactivate={() => setActiveTool(null)}
      />

      {/* Element manipulation tool */}
      <ElementManipulationTool3D isActive={!!selectedElementId && activeTool === null} />

      {/* Selection gizmo */}
      <SelectionGizmo3D />

      {/* Measurement tool */}
      <MeasurementTool3D />
    </group>
  );
}
