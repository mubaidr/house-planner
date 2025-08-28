import { useDesignStore } from '@/stores/designStore';
import { useGridStore } from '@/stores/gridStore';
import { useLightingStore } from '@/stores/lightingStore';
import { Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Canvas2D } from '../Canvas2D/Canvas2D';
import { CameraControls } from './Camera/CameraControls';
import { PostProcessing3D } from './Effects/PostProcessing3D';
import { ElementRenderer3D } from './Elements/ElementRenderer3D';
import { SceneLighting } from './Lighting/SceneLighting';
import { ElementManipulationTool3D } from './Tools/ElementManipulationTool3D';
import { MeasurementTool3D } from './Tools/MeasurementTool3D';
import { RoomCreationTool3D } from './Tools/RoomCreationTool3D';
import { SelectionGizmo3D } from './Tools/SelectionGizmo3D';
import { WallDrawingTool3D } from './Tools/WallDrawingTool3D';

export function Scene3D() {
  const viewMode = useDesignStore(state => state.viewMode);
  const activeTool = useDesignStore(state => state.activeTool);
  const setActiveTool = useDesignStore(state => state.setActiveTool);
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const { isVisible: isGridVisible, spacing: gridSpacing } = useGridStore();

  // Phase 4: Lighting and material system
  const { currentConfig: lightingConfig, renderQuality, performanceMode } = useLightingStore();

  // Don't render in 2D mode
  if (viewMode === '2d') {
    return <Canvas2D />;
  }

  return (
    <Canvas
      camera={{ position: [0, 10, 10], fov: 75 }}
      shadows={lightingConfig.directional.shadows}
      gl={{
        antialias: renderQuality.antiAliasing,
        import { useDesignStore } from '@/stores/designStore';
import { useGridStore } from '@/stores/gridStore';
import { useLightingStore } from '@/stores/lightingStore';
import { Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Canvas2D } from '../Canvas2D/Canvas2D';
import { HoverInfoDisplay } from '../UI/HoverInfoDisplay';
import { CameraControls } from './Camera/CameraControls';
import { PostProcessing3D } from './Effects/PostProcessing3D';
import { ElementRenderer3D } from './Elements/ElementRenderer3D';
import { SceneLighting } from './Lighting/SceneLighting';
import { AddElementTool } from './Tools/AddElementTool';
import { ElementManipulationTool3D } from './Tools/ElementManipulationTool3D';
import { MeasurementTool3D } from './Tools/MeasurementTool3D';
import { RoomCreationTool3D } from './Tools/RoomCreationTool3D';
import { SelectionGizmo3D } from './Tools/SelectionGizmo3D';
import { WallDrawingTool3D } from './Tools/WallDrawingTool3D';

export function Scene3D() {
  const viewMode = useDesignStore(state => state.viewMode);
  const activeTool = useDesignStore(state => state.activeTool);
  const setActiveTool = useDesignStore(state => state.setActiveTool);
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const { isVisible: isGridVisible, spacing: gridSpacing } = useGridStore();

  // Phase 4: Lighting and material system
  const { currentConfig: lightingConfig, renderQuality, performanceMode } = useLightingStore();

  // Don't render in 2D mode
  if (viewMode === '2d') {
    return <Canvas2D />;
  }

  return (
    <Canvas
      camera={{ position: [0, 10, 10], fov: 75 }}
      shadows={lightingConfig.directional.shadows}
      gl={{
        antialias: renderQuality.antiAliasing,
        toneMapping: lightingConfig.postProcessing.toneMapping,
        toneMappingExposure: lightingConfig.postProcessing.exposure,
      }}
      dpr={renderQuality.textureResolution === 'ultra' ? 2 : 1}
    >
      <Suspense fallback={null}>
        {/* Performance monitoring */}
        {performanceMode === 'auto' && <Stats />}

        {/* Phase 4: Enhanced lighting system */}
        <SceneLighting config={lightingConfig} />

        {/* Grid for reference */}
        {isGridVisible && (
          <Grid
            position={[0, -0.01, 0]}
            args={[20, 20]}
            cellSize={gridSpacing}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={gridSpacing * 5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={30}
            fadeStrength={1}
          />
        )}

        {/* Camera controls */}
        <CameraControls />

        {/* Render all elements */}
        <ElementRenderer3D />

        {/* Interactive tools */}
        {activeTool === 'wall' && (
          <group key="wall-tool">
            <WallDrawingTool3D isActive={true} onDeactivate={() => setActiveTool(null)} />
          </group>
        )}
        {(activeTool === 'add-door' || activeTool === 'add-window') && (
          <group key="add-element-tool">
            <AddElementTool 
              isActive={true} 
              elementType={activeTool === 'add-door' ? 'door' : 'window'} 
              onDeactivate={() => setActiveTool(null)} 
            />
          </group>
        )}
        {activeTool === 'room' && (
          <group key="room-tool">
            <RoomCreationTool3D isActive={true} onDeactivate={() => setActiveTool(null)} />
          </group>
        )}
        {activeTool === 'measure' && (
          <group key="measure-tool">
            <MeasurementTool3D />
          </group>
        )}
        {!!selectedElementId && activeTool === null && (
          <group key="manipulation-tool">
            <ElementManipulationTool3D isActive={true} />
          </group>
        )}

        {/* Selection gizmo */}
        <SelectionGizmo3D />

        {/* Phase 4: Enhanced post-processing effects */}
        <PostProcessing3D config={lightingConfig} enabled={renderQuality.postProcessing} />

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
        />
      </Suspense>
      <HoverInfoDisplay />
    </Canvas>
  );
}

        toneMappingExposure: lightingConfig.postProcessing.exposure,
      }}
      dpr={renderQuality.textureResolution === 'ultra' ? 2 : 1}
    >
      <Suspense fallback={null}>
        {/* Performance monitoring */}
        {performanceMode === 'auto' && <Stats />}

        {/* Phase 4: Enhanced lighting system */}
        <SceneLighting config={lightingConfig} />

        {/* Grid for reference */}
        {isGridVisible && (
          <Grid
            position={[0, -0.01, 0]}
            args={[20, 20]}
            cellSize={gridSpacing}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={gridSpacing * 5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={30}
            fadeStrength={1}
          />
        )}

        {/* Camera controls */}
        <CameraControls />

        {/* Render all elements */}
        <ElementRenderer3D />

        {/* Interactive tools */}
        {activeTool === 'wall' && (
          <group key="wall-tool">
            <WallDrawingTool3D isActive={true} onDeactivate={() => setActiveTool(null)} />
          </group>
        )}
        {activeTool === 'room' && (
          <group key="room-tool">
            <RoomCreationTool3D isActive={true} onDeactivate={() => setActiveTool(null)} />
          </group>
        )}
        {activeTool === 'measure' && (
          <group key="measure-tool">
            <MeasurementTool3D />
          </group>
        )}
        {!!selectedElementId && activeTool === null && (
          <group key="manipulation-tool">
            <ElementManipulationTool3D isActive={true} />
          </group>
        )}

        {/* Selection gizmo */}
        <SelectionGizmo3D />

        {/* Phase 4: Enhanced post-processing effects */}
        <PostProcessing3D config={lightingConfig} enabled={renderQuality.postProcessing} />

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
        />
      </Suspense>
    </Canvas>
  );
}
