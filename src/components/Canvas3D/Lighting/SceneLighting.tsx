import { LightingConfig } from '@/types/materials3D';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneLightingProps {
  config: LightingConfig;
}

export function SceneLighting({ config }: SceneLightingProps) {
  const { gl } = useThree();
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  // Configure shadow settings
  useEffect(() => {
    if (config.directional.shadows) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      gl.shadowMap.enabled = false;
    }
  }, [gl, config.directional.shadows]);

  // Configure directional light shadows
  useEffect(() => {
    if (directionalLightRef.current && config.directional.shadows) {
      const light = directionalLightRef.current;
      light.shadow.mapSize.width = config.directional.shadowMapSize;
      light.shadow.mapSize.height = config.directional.shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 50;
      light.shadow.camera.left = -20;
      light.shadow.camera.right = 20;
      light.shadow.camera.top = 20;
      light.shadow.camera.bottom = -20;
      light.shadow.bias = -0.0001;
    }
  }, [config.directional.shadows, config.directional.shadowMapSize]);

  // Configure tone mapping and exposure
  useEffect(() => {
    if (config.postProcessing.enabled) {
      gl.toneMapping = config.postProcessing.toneMapping;
      gl.toneMappingExposure = config.postProcessing.exposure;
    } else {
      gl.toneMapping = THREE.LinearToneMapping;
      gl.toneMappingExposure = 1;
    }
  }, [gl, config.postProcessing]);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={config.ambient.intensity} color={config.ambient.color} />

      {/* Directional lighting (sun) */}
      <directionalLight
        ref={directionalLightRef}
        position={config.directional.position}
        intensity={config.directional.intensity}
        color={config.directional.color}
        castShadow={config.directional.shadows}
      />

      {/* Fill light for better illumination */}
      <pointLight
        position={[-10, 10, -10]}
        intensity={0.2}
        color="#ffffff"
        decay={2}
        distance={30}
      />

      {/* Environment */}
      {config.environment.preset !== 'custom' &&
        config.environment.preset !== 'noon' &&
        config.environment.preset !== 'overcast' && (
          <Environment
            preset={config.environment.preset}
            background={config.environment.background}
            environmentIntensity={config.environment.intensity}
          />
        )}

      {/* Additional atmospheric lighting based on time of day */}
      {config.timeOfDay.hour >= 18 || config.timeOfDay.hour <= 6 ? (
        // Night/evening lighting
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#FFE4B5" decay={2} distance={20} />
      ) : null}
    </>
  );
}
