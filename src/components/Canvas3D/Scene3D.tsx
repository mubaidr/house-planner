import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useDesignStore } from '@/stores/designStore';
import { ElementRenderer3D } from './Elements/ElementRenderer3D';
import { SceneLighting } from './Lighting/SceneLighting';
import { CameraControls } from './Camera/CameraControls';
import { PostProcessing3D } from './Effects/PostProcessing3D';

export function Scene3D() {
  const viewMode = useDesignStore(state => state.viewMode);

  // Don't render in 2D mode
  if (viewMode === '2d') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">2D Mode</h2>
          <p className="text-gray-600">Switch to 3D mode to view the 3D scene</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 10, 10], fov: 75 }}
      shadows
    >
      {/* Lighting */}
      <SceneLighting />
      
      {/* Grid for reference */}
      <Grid 
        position={[0, -0.01, 0]} 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={30}
        fadeStrength={1}
      />
      
      {/* Camera controls */}
      <CameraControls />
      
      {/* Render all elements */}
      <ElementRenderer3D />
      
      {/* Post-processing effects */}
      <PostProcessing3D />
      
      {/* Camera controls */}
      <OrbitControls 
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  );
}