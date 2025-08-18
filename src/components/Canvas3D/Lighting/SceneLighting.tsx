import { Environment, ContactShadows } from '@react-three/drei';

export function SceneLighting() {
  return (
    <>
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sun) */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.6} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light from opposite direction */}
      <pointLight position={[-10, 10, -10]} intensity={0.3} />
      
      {/* Environment lighting for realistic reflections */}
      <Environment preset="apartment" />
      
      {/* Contact shadows for realism */}
      <ContactShadows 
        position={[0, -0.01, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={1} 
        far={1} 
      />
    </>
  );
}