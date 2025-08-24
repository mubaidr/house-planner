import { LightingConfig } from '@/types/materials3D';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  SSAO,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

interface PostProcessing3DProps {
  config: LightingConfig;
  enabled?: boolean;
}

export function PostProcessing3D({ config, enabled = true }: PostProcessing3DProps) {
  if (!enabled || !config.postProcessing.enabled) {
    return null;
  }

  const effects = [];

  // Tone Mapping (always included)
  effects.push(
    <ToneMapping
      key="tone"
      mode={config.postProcessing.toneMapping}
      exposure={config.postProcessing.exposure}
    />
  );

  // Bloom Effect
  if (config.postProcessing.bloom) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={0.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.025}
        blendFunction={BlendFunction.ADD}
      />
    );
  }

  // Screen Space Ambient Occlusion
  if (config.postProcessing.ssao) {
    effects.push(
      <SSAO
        key="ssao"
        blendFunction={BlendFunction.MULTIPLY}
        samples={30}
        rings={4}
        distanceThreshold={1.0}
        distanceFalloff={0.0}
        rangeThreshold={0.5}
        rangeFalloff={0.1}
        luminanceInfluence={0.9}
        radius={20}
        bias={0.5}
      />
    );
  }

  // Depth of Field for cinematic effect
  if (config.environment.preset === 'studio') {
    effects.push(
      <DepthOfField key="dof" focusDistance={0.1} focalLength={0.02} bokehScale={2} height={480} />
    );
  }

  return <EffectComposer>{effects}</EffectComposer>;
}
