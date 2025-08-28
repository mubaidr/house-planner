import { useToolStore } from '@/stores/toolStore';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';

export function HoverInfoDisplay() {
  const { hoveredElementId, hoveredElementType } = useToolStore();
  const { mouse } = useThree();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX + 15, y: event.clientY + 15 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!hoveredElementId || !hoveredElementType) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {hoveredElementType}: {hoveredElementId}
    </div>
  );
}
