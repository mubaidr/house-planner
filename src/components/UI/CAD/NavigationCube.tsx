import { Home, Maximize, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface NavigationCubeProps {
  className?: string;
  theme: 'light' | 'dark' | 'classic';
}

export function NavigationCube({ className = '', theme }: NavigationCubeProps) {
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);

  const faces = [
    { id: 'front', label: 'FRONT', position: 'translate3d(0, 0, 50px)' },
    { id: 'back', label: 'BACK', position: 'translate3d(0, 0, -50px) rotateY(180deg)' },
    { id: 'right', label: 'RIGHT', position: 'translate3d(50px, 0, 0) rotateY(90deg)' },
    { id: 'left', label: 'LEFT', position: 'translate3d(-50px, 0, 0) rotateY(-90deg)' },
    { id: 'top', label: 'TOP', position: 'translate3d(0, -50px, 0) rotateX(90deg)' },
    { id: 'bottom', label: 'BOTTOM', position: 'translate3d(0, 50px, 0) rotateX(-90deg)' },
  ];

  const handleFaceClick = (faceId: string) => {
    console.log(`Navigate to ${faceId} view`);
    // This would trigger the camera to move to the corresponding view
  };

  return (
    <div className={`${className} select-none`}>
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
        {/* Navigation Cube */}
        <div className="relative w-24 h-24 mx-auto mb-3" style={{ perspective: '200px' }}>
          <div
            className="relative w-full h-full transition-transform duration-300 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(-15deg) rotateY(25deg)',
            }}
          >
            {faces.map(face => (
              <button
                key={face.id}
                className={`absolute w-full h-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold ${
                  hoveredFace === face.id
                    ? 'bg-blue-500/80 border-blue-400 text-white'
                    : 'bg-gray-700/80 border-gray-500 text-gray-300 hover:bg-gray-600/80'
                }`}
                style={{ transform: face.position }}
                onClick={() => handleFaceClick(face.id)}
                onMouseEnter={() => setHoveredFace(face.id)}
                onMouseLeave={() => setHoveredFace(null)}
              >
                {face.label}
              </button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-1">
          <button
            className="p-1 hover:bg-gray-700 rounded"
            title="Reset View"
            onClick={() => console.log('Reset view')}
          >
            <Home size={12} />
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            title="Fit to Screen"
            onClick={() => console.log('Fit to screen')}
          >
            <Maximize size={12} />
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            title="Rotate View"
            onClick={() => console.log('Rotate view')}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
