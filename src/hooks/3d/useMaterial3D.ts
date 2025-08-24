import { useDesignStore } from '@/stores/designStore';
import { useMemo } from 'react';
import * as THREE from 'three';

interface MaterialProps {
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  metalnessMap?: THREE.Texture;
  aoMap?: THREE.Texture;
}

export function useMaterial3D(materialId?: string) {
  const material = useDesignStore(state => state.materials.find(m => m.id === materialId));

  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  const materialProps = useMemo(() => {
    if (!material) return {};

    const props: Partial<MaterialProps> = {
      color: material.color,
      roughness: material.roughness,
      metalness: material.metalness,
      opacity: material.opacity,
      transparent: material.opacity < 1,
    };

    if (material.map) {
      props.map = textureLoader.load(material.map);
    }
    if (material.normalMap) {
      props.normalMap = textureLoader.load(material.normalMap);
    }
    if (material.roughnessMap) {
      props.roughnessMap = textureLoader.load(material.roughnessMap);
    }
    if (material.metalnessMap) {
      props.metalnessMap = textureLoader.load(material.metalnessMap);
    }
    if (material.aoMap) {
      props.aoMap = textureLoader.load(material.aoMap);
    }

    return props;
  }, [material, textureLoader]);

  return materialProps;
}
