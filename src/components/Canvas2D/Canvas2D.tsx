import { useDesignStore } from '@/stores/designStore';

export function Canvas2D() {
  const walls = useDesignStore(state => state.walls);
  const doors = useDesignStore(state => state.doors);
  const windows = useDesignStore(state => state.windows);

  return (
    <div className="w-full h-full bg-white">
      <svg width="100%" height="100%" viewBox="-10 -10 20 20">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6f6f6f" />
          </marker>
        </defs>

        {/* Grid */}
        <path d="M -10 0 H 10 M 0 -10 V 10" stroke="#e0e0e0" strokeWidth="0.05" />

        {/* Walls */}
        {walls.map(wall => (
          <line
            key={wall.id}
            x1={wall.start.x}
            y1={wall.start.z}
            x2={wall.end.x}
            y2={wall.end.z}
            stroke="#333"
            strokeWidth={wall.thickness}
          />
        ))}

        {/* Doors */}
        {doors.map(door => {
          const wall = walls.find(w => w.id === door.wallId);
          if (!wall) return null;

          const wallLength = Math.sqrt(
            Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
          );
          const positionRatio = door.position / 100;
          const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

          const doorX = wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio;
          const doorZ = wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio;

          return (
            <g
              key={door.id}
              transform={`translate(${doorX}, ${doorZ}) rotate(${wallAngle * (180 / Math.PI)})`}
            >
              <rect
                x={-door.width / 2}
                y={-door.thickness / 2}
                width={door.width}
                height={door.thickness}
                fill="#fff"
                stroke="#333"
                strokeWidth="0.05"
              />
              <path
                d={`M ${-door.width / 2} 0 A ${door.width} ${door.width} 0 0 1 ${door.width / 2} ${door.width}`}
                stroke="#999"
                strokeWidth="0.05"
                fill="none"
                strokeDasharray="0.2,0.2"
              />
            </g>
          );
        })}

        {/* Windows */}
        {windows.map(window => {
          const wall = walls.find(w => w.id === window.wallId);
          if (!wall) return null;

          const wallLength = Math.sqrt(
            Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
          );
          const positionRatio = window.position / 100;
          const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

          const windowX = wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio;
          const windowZ = wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio;

          return (
            <g
              key={window.id}
              transform={`translate(${windowX}, ${windowZ}) rotate(${wallAngle * (180 / Math.PI)})`}
            >
              <rect
                x={-window.width / 2}
                y={-window.thickness / 2}
                width={window.width}
                height={window.thickness}
                fill="#87CEEB"
                stroke="#333"
                strokeWidth="0.05"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
