import { useDesignStore } from '@/stores/designStore';

export function SceneLighting() {
  const { scene3D } = useDesignStore();
  const { lighting } = scene3D;

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={lighting.ambientIntensity} />

      {/* Directional light for shadows and definition */}
      <directionalLight
        position={lighting.directionalPosition}
        intensity={lighting.directionalIntensity}
        castShadow={lighting.shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Fill light to reduce harsh shadows */}
      <directionalLight
        position={[-5, 8, -5]}
        intensity={lighting.directionalIntensity * 0.3}
        castShadow={false}
      />

      {/* Subtle hemisphere light for natural ambient */}
      <hemisphereLight
        args={["#b1e1ff", "#ffecd1", 0.2]}
      />
    </>
  );
}
