import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

export function PostProcessing3D() {
  return (
    <EffectComposer>
      {/* Bloom effect for highlights */}
      <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.025} />

      {/* Vignette effect for cinematic feel */}
      <Vignette offset={0.1} darkness={0.2} />
    </EffectComposer>
  );
}
