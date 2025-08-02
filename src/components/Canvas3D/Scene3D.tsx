import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { SceneLighting } from './Lighting/SceneLighting';
import { CameraControls } from './Camera/CameraControls';
import { ElementRenderer3D } from './Elements/ElementRenderer3D';
import { useDesignStore } from '@/stores/designStore';

interface Scene3DProps {
  className?: string;
  onElementSelect?: (id: string, type: string) => void;
}

export function Scene3D({ className, onElementSelect }: Scene3DProps) {
  const { scene3D, initializeScene3D } = useDesignStore();

  // Initialize scene on first render
  if (!scene3D.initialized) {
    initializeScene3D();
  }

  return (
    <div className={className || "w-full h-full"}>
      <Canvas
        camera={{
          position: scene3D.camera.position,
          fov: scene3D.camera.fov,
        }}
        shadows={scene3D.renderSettings.shadows}
        dpr={[1, scene3D.renderSettings.quality === 'high' ? 2 : 1]}
        gl={{
          antialias: scene3D.renderSettings.antialias,
          alpha: true
        }}
      >
        <Suspense fallback={null}>
          <SceneLighting />

          <ElementRenderer3D onElementSelect={onElementSelect} />

          <CameraControls />

          {/* Environment helpers */}
          {scene3D.environment.gridHelper && (
            <gridHelper args={[20, 20, '#888888', '#bbbbbb']} />
          )}

          {scene3D.environment.groundPlane && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.01, 0]}
              receiveShadow
            >
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial
                color="#f8f9fa"
                transparent
                opacity={0.5}
              />
            </mesh>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
