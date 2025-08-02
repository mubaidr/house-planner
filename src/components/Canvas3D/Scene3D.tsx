import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { SceneLighting } from './Lighting/SceneLighting';
import { CameraControls } from './Camera/CameraControls';
import { ElementRenderer3D } from './Elements/ElementRenderer3D';
import { GestureHandler3D } from './GestureHandler3D';
import { useDesignStore } from '@/stores/designStore';
import * as THREE from 'three';

// Phase 3: Physics & Advanced Interactions
import { PhysicsWorld } from './Physics/PhysicsWorld';
import { EnhancedCameraControls } from './Camera/EnhancedCameraControls';
import { MeasureTool3D } from './Tools/MeasureTool3D';
import ObjectManipulator from './Tools/ObjectManipulator';
import { ElementPropertiesPanel3D, ToolPalette3D, InfoHUD3D } from './UI/ElementPropertiesPanel3D';

interface Scene3DProps {
  className?: string;
  onElementSelect?: (id: string, type: string) => void;
}

export function Scene3D({ className, onElementSelect }: Scene3DProps) {
  const { scene3D, initializeScene3D } = useDesignStore();

  // Phase 3: UI States
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showToolPalette, setShowToolPalette] = useState(true);
  const [showInfoHUD, setShowInfoHUD] = useState(true);
  const [measureToolActive, setMeasureToolActive] = useState(false);
  const [manipulatorActive, setManipulatorActive] = useState(false);

  // Ref for object manipulation
  const manipulatorTargetRef = useRef<THREE.Object3D>(null);

  // Initialize scene on first render
  if (!scene3D.initialized) {
    initializeScene3D();
  }

  const handleElementSelect = (id: string, type: string) => {
    setShowPropertiesPanel(true);
    onElementSelect?.(id, type);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'm':
        event.preventDefault();
        setMeasureToolActive(!measureToolActive);
        break;
      case 'g':
        event.preventDefault();
        setManipulatorActive(!manipulatorActive);
        break;
      case 'escape':
        event.preventDefault();
        setMeasureToolActive(false);
        setManipulatorActive(false);
        setShowPropertiesPanel(false);
        break;
      case 'p':
        event.preventDefault();
        setShowPropertiesPanel(!showPropertiesPanel);
        break;
      case 't':
        event.preventDefault();
        setShowToolPalette(!showToolPalette);
        break;
      case 'i':
        event.preventDefault();
        setShowInfoHUD(!showInfoHUD);
        break;
    }
  };

  // Add keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [measureToolActive, manipulatorActive, showPropertiesPanel, showToolPalette, showInfoHUD]);

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
          {/* Phase 3: Physics World Integration */}
          {scene3D.physics?.enabled ? (
            <PhysicsWorld>
              <SceneLighting />

              <GestureHandler3D>
                <ElementRenderer3D onElementSelect={handleElementSelect} />

                {/* Phase 3: Advanced Tools */}
                {measureToolActive && <MeasureTool3D isActive={measureToolActive} />}
                {manipulatorActive && (
                  <group>
                    <mesh ref={manipulatorTargetRef} position={[0, 1, 0]}>
                      <boxGeometry args={[1, 1, 1]} />
                      <meshStandardMaterial color="#ff6b6b" />
                    </mesh>
                    {manipulatorTargetRef.current && (
                      <ObjectManipulator targetRef={manipulatorTargetRef as any} />
                    )}
                  </group>
                )}                {/* Environment helpers */}
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
              </GestureHandler3D>

              {/* Phase 3: Enhanced Camera Controls */}
              <EnhancedCameraControls />

              {/* Phase 3: 3D UI Elements */}
              <ElementPropertiesPanel3D
                position={[3, 2, 0]}
                visible={showPropertiesPanel}
                onClose={() => setShowPropertiesPanel(false)}
              />

              <ToolPalette3D
                position={[-4, 1, 0]}
                visible={showToolPalette}
              />

              <InfoHUD3D
                position={[-4, -2, 0]}
                visible={showInfoHUD}
              />
            </PhysicsWorld>
          ) : (
            // Fallback to non-physics mode
            <>
              <SceneLighting />

              <GestureHandler3D>
                <ElementRenderer3D onElementSelect={handleElementSelect} />

                {/* Phase 3: Advanced Tools */}
                {measureToolActive && <MeasureTool3D isActive={measureToolActive} />}
                {manipulatorActive && (
                  <group>
                    <mesh position={[0, 1, 0]}>
                      <boxGeometry args={[1, 1, 1]} />
                      <meshStandardMaterial color="#ff6b6b" />
                    </mesh>
                    <ObjectManipulator targetRef={manipulatorTargetRef as any} />
                  </group>
                )}                {/* Environment helpers */}
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
              </GestureHandler3D>

              {/* Phase 3: Enhanced Camera Controls */}
              <EnhancedCameraControls />

              {/* Phase 3: 3D UI Elements */}
              <ElementPropertiesPanel3D
                position={[3, 2, 0]}
                visible={showPropertiesPanel}
                onClose={() => setShowPropertiesPanel(false)}
              />

              <ToolPalette3D
                position={[-4, 1, 0]}
                visible={showToolPalette}
              />

              <InfoHUD3D
                position={[-4, -2, 0]}
                visible={showInfoHUD}
              />

              <CameraControls />
            </>
          )}
        </Suspense>
      </Canvas>

      {/* Phase 3: Keyboard Shortcuts Help */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Keyboard Shortcuts</div>
        <div>M - Toggle Measure Tool</div>
        <div>G - Toggle Object Manipulator</div>
        <div>P - Toggle Properties Panel</div>
        <div>T - Toggle Tool Palette</div>
        <div>I - Toggle Info HUD</div>
        <div>ESC - Close All Tools</div>
        <div>F - Focus on Selection</div>
        <div>1-4 - Camera Presets</div>
      </div>
    </div>
  );
}
