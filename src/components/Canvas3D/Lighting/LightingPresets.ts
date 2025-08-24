import { EnvironmentPreset, LightingConfig } from '@/types/materials3D';
import * as THREE from 'three';

// Predefined lighting configurations for different scenarios
export const lightingPresets: Record<EnvironmentPreset, LightingConfig> = {
  sunset: {
    ambient: {
      intensity: 0.3,
      color: '#FFA500',
    },
    directional: {
      position: [-10, 5, -5],
      intensity: 0.8,
      color: '#FF6347',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'sunset',
      background: true,
      intensity: 0.6,
    },
    timeOfDay: {
      hour: 18,
      season: 'summer',
    },
    postProcessing: {
      enabled: true,
      bloom: true,
      ssao: false,
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.2,
    },
  },

  dawn: {
    ambient: {
      intensity: 0.2,
      color: '#E6E6FA',
    },
    directional: {
      position: [10, 3, 5],
      intensity: 0.6,
      color: '#FFB6C1',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'dawn',
      background: true,
      intensity: 0.4,
    },
    timeOfDay: {
      hour: 6,
      season: 'spring',
    },
    postProcessing: {
      enabled: true,
      bloom: false,
      ssao: true,
      toneMapping: THREE.LinearToneMapping,
      exposure: 0.8,
    },
  },

  noon: {
    ambient: {
      intensity: 0.4,
      color: '#FFFFFF',
    },
    directional: {
      position: [0, 20, 0],
      intensity: 1.0,
      color: '#FFFFFF',
      shadows: true,
      shadowMapSize: 4096,
    },
    environment: {
      preset: 'noon',
      background: true,
      intensity: 1.0,
    },
    timeOfDay: {
      hour: 12,
      season: 'summer',
    },
    postProcessing: {
      enabled: true,
      bloom: false,
      ssao: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.0,
    },
  },

  night: {
    ambient: {
      intensity: 0.1,
      color: '#191970',
    },
    directional: {
      position: [5, 10, 5],
      intensity: 0.2,
      color: '#4169E1',
      shadows: true,
      shadowMapSize: 1024,
    },
    environment: {
      preset: 'night',
      background: true,
      intensity: 0.2,
    },
    timeOfDay: {
      hour: 22,
      season: 'winter',
    },
    postProcessing: {
      enabled: true,
      bloom: true,
      ssao: true,
      toneMapping: THREE.CineonToneMapping,
      exposure: 0.6,
    },
  },

  overcast: {
    ambient: {
      intensity: 0.6,
      color: '#D3D3D3',
    },
    directional: {
      position: [0, 15, 0],
      intensity: 0.4,
      color: '#D3D3D3',
      shadows: false,
      shadowMapSize: 1024,
    },
    environment: {
      preset: 'overcast',
      background: true,
      intensity: 0.8,
    },
    timeOfDay: {
      hour: 14,
      season: 'autumn',
    },
    postProcessing: {
      enabled: false,
      bloom: false,
      ssao: false,
      toneMapping: THREE.LinearToneMapping,
      exposure: 1.0,
    },
  },

  studio: {
    ambient: {
      intensity: 0.3,
      color: '#FFFFFF',
    },
    directional: {
      position: [10, 10, 10],
      intensity: 0.8,
      color: '#FFFFFF',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'studio',
      background: false,
      intensity: 0.5,
    },
    timeOfDay: {
      hour: 12,
      season: 'summer',
    },
    postProcessing: {
      enabled: true,
      bloom: false,
      ssao: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.0,
    },
  },

  warehouse: {
    ambient: {
      intensity: 0.2,
      color: '#F5F5F5',
    },
    directional: {
      position: [0, 20, 0],
      intensity: 0.6,
      color: '#F0F8FF',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'warehouse',
      background: false,
      intensity: 0.3,
    },
    timeOfDay: {
      hour: 10,
      season: 'spring',
    },
    postProcessing: {
      enabled: false,
      bloom: false,
      ssao: false,
      toneMapping: THREE.LinearToneMapping,
      exposure: 1.0,
    },
  },

  apartment: {
    ambient: {
      intensity: 0.4,
      color: '#FFF8DC',
    },
    directional: {
      position: [5, 8, 5],
      intensity: 0.5,
      color: '#FFFACD',
      shadows: true,
      shadowMapSize: 1024,
    },
    environment: {
      preset: 'apartment',
      background: false,
      intensity: 0.4,
    },
    timeOfDay: {
      hour: 16,
      season: 'autumn',
    },
    postProcessing: {
      enabled: true,
      bloom: false,
      ssao: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 0.9,
    },
  },

  forest: {
    ambient: {
      intensity: 0.3,
      color: '#228B22',
    },
    directional: {
      position: [8, 15, 3],
      intensity: 0.7,
      color: '#ADFF2F',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'forest',
      background: true,
      intensity: 0.6,
    },
    timeOfDay: {
      hour: 14,
      season: 'summer',
    },
    postProcessing: {
      enabled: true,
      bloom: false,
      ssao: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.1,
    },
  },

  city: {
    ambient: {
      intensity: 0.5,
      color: '#708090',
    },
    directional: {
      position: [10, 12, 8],
      intensity: 0.6,
      color: '#F5F5F5',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'city',
      background: true,
      intensity: 0.7,
    },
    timeOfDay: {
      hour: 15,
      season: 'spring',
    },
    postProcessing: {
      enabled: true,
      bloom: false,
      ssao: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.0,
    },
  },

  custom: {
    ambient: {
      intensity: 0.4,
      color: '#FFFFFF',
    },
    directional: {
      position: [10, 10, 10],
      intensity: 0.6,
      color: '#FFFFFF',
      shadows: true,
      shadowMapSize: 2048,
    },
    environment: {
      preset: 'custom',
      background: false,
      intensity: 0.5,
    },
    timeOfDay: {
      hour: 12,
      season: 'summer',
    },
    postProcessing: {
      enabled: false,
      bloom: false,
      ssao: false,
      toneMapping: THREE.LinearToneMapping,
      exposure: 1.0,
    },
  },
};

// Helper function to interpolate between lighting presets based on time
export function interpolateLightingByTime(hour: number): LightingConfig {
  // Normalize hour to 0-1
  const normalizedHour = hour / 24;

  if (normalizedHour < 0.25) {
    // Night to dawn (0-6 hours)
    return interpolateConfigs(lightingPresets.night, lightingPresets.dawn, normalizedHour * 4);
  } else if (normalizedHour < 0.5) {
    // Dawn to noon (6-12 hours)
    return interpolateConfigs(
      lightingPresets.dawn,
      lightingPresets.noon,
      (normalizedHour - 0.25) * 4
    );
  } else if (normalizedHour < 0.75) {
    // Noon to sunset (12-18 hours)
    return interpolateConfigs(
      lightingPresets.noon,
      lightingPresets.sunset,
      (normalizedHour - 0.5) * 4
    );
  } else {
    // Sunset to night (18-24 hours)
    return interpolateConfigs(
      lightingPresets.sunset,
      lightingPresets.night,
      (normalizedHour - 0.75) * 4
    );
  }
}

// Interpolate between two lighting configurations
function interpolateConfigs(
  config1: LightingConfig,
  config2: LightingConfig,
  t: number
): LightingConfig {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return {
    ambient: {
      intensity: lerp(config1.ambient.intensity, config2.ambient.intensity, t),
      color: config1.ambient.color, // Color interpolation would be more complex
    },
    directional: {
      position: [
        lerp(config1.directional.position[0], config2.directional.position[0], t),
        lerp(config1.directional.position[1], config2.directional.position[1], t),
        lerp(config1.directional.position[2], config2.directional.position[2], t),
      ],
      intensity: lerp(config1.directional.intensity, config2.directional.intensity, t),
      color: config1.directional.color,
      shadows: config1.directional.shadows,
      shadowMapSize: config1.directional.shadowMapSize,
    },
    environment: {
      preset: t < 0.5 ? config1.environment.preset : config2.environment.preset,
      background: config1.environment.background,
      intensity: lerp(config1.environment.intensity, config2.environment.intensity, t),
    },
    timeOfDay: {
      hour: lerp(config1.timeOfDay.hour, config2.timeOfDay.hour, t),
      season: config1.timeOfDay.season,
    },
    postProcessing: {
      enabled: config1.postProcessing.enabled,
      bloom: config1.postProcessing.bloom,
      ssao: config1.postProcessing.ssao,
      toneMapping: config1.postProcessing.toneMapping,
      exposure: lerp(config1.postProcessing.exposure, config2.postProcessing.exposure, t),
    },
  };
}
