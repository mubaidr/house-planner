import { useDesignStore } from '@/stores/designStore';
import { useEffect, useMemo } from 'react';
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

interface TextureUrls {
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
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

    // Store texture URLs to create textures
    const textureUrls: TextureUrls = {};
    if (material.map) textureUrls.map = material.map;
    if (material.normalMap) textureUrls.normalMap = material.normalMap;
    if (material.roughnessMap) textureUrls.roughnessMap = material.roughnessMap;
    if (material.metalnessMap) textureUrls.metalnessMap = material.metalnessMap;
    if (material.aoMap) textureUrls.aoMap = material.aoMap;

    return { ...props, textureUrls };
  }, [material]);

  // Load textures and handle cleanup
  const textures = useMemo(() => {
    if (!('textureUrls' in materialProps)) return {};

    const { textureUrls } = materialProps as { textureUrls: TextureUrls };
    const loadedTextures: { [key: string]: THREE.Texture } = {};

    Object.keys(textureUrls).forEach(key => {
      try {
        loadedTextures[key] = textureLoader.load(textureUrls[key as keyof TextureUrls] as string);
      } catch (error) {
        console.warn(`Failed to load texture: ${textureUrls[key as keyof TextureUrls]}`, error);
      }
    });

    return loadedTextures;
  }, [materialProps, textureLoader]);

  // Clean up textures when component unmounts or material changes
  useEffect(() => {
    const texturesToDispose = { ...textures };
    return () => {
      Object.values(texturesToDispose).forEach(texture => {
        if (texture && typeof (texture as any).dispose === 'function') {
          (texture as any).dispose();
        }
      });
    };
  }, [textures]);

  // Return final material props with loaded textures
  return useMemo(() => {
    if (!material) return {};

    const { textureUrls: _, ...baseProps } = materialProps as { textureUrls: TextureUrls };
    return { ...baseProps, ...textures };
  }, [material, materialProps, textures]);
}
