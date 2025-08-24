import { lightingPresets } from '@/components/Canvas3D/Lighting/LightingPresets';
import { EnvironmentPreset, LightingConfig, RenderQuality } from '@/types/materials3D';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface LightingState {
  // Current lighting configuration
  currentConfig: LightingConfig;

  // Render quality settings
  renderQuality: RenderQuality;

  // UI state
  isLightingPanelOpen: boolean;
  isMaterialEditorOpen: boolean;

  // Performance monitoring
  performanceMode: 'auto' | 'performance' | 'quality';
  frameRate: number;
}

interface LightingActions {
  // Lighting configuration
  setLightingConfig: (config: LightingConfig) => void;
  setLightingPreset: (preset: EnvironmentPreset) => void;
  updateLightingProperty: <T extends keyof LightingConfig>(
    section: T,
    property: string,
    value: LightingConfig[T] extends Record<string, infer U> ? U : never
  ) => void;

  // Render quality
  setRenderQuality: (quality: RenderQuality) => void;
  setPerformanceMode: (mode: 'auto' | 'performance' | 'quality') => void;
  updateFrameRate: (fps: number) => void;

  // UI controls
  toggleLightingPanel: () => void;
  toggleMaterialEditor: () => void;

  // Auto-optimization
  optimizeForPerformance: () => void;
  resetToDefaults: () => void;
}

// Default configurations
const defaultLightingConfig: LightingConfig = lightingPresets.studio;

const defaultRenderQuality: RenderQuality = {
  textureResolution: 'medium',
  shadowQuality: 'medium',
  antiAliasing: true,
  postProcessing: true,
  maxTextures: 50,
  lodEnabled: true,
};

export const useLightingStore = create<LightingState & LightingActions>()(
  subscribeWithSelector(
    immer((set, _get) => ({
      // Initial state
      currentConfig: defaultLightingConfig,
      renderQuality: defaultRenderQuality,
      isLightingPanelOpen: false,
      isMaterialEditorOpen: false,
      performanceMode: 'auto',
      frameRate: 60,

      // Lighting configuration actions
      setLightingConfig: config =>
        set(state => {
          state.currentConfig = config;
        }),

      setLightingPreset: preset =>
        set(state => {
          state.currentConfig = lightingPresets[preset];
        }),

      updateLightingProperty: (section, property, value) =>
        set(state => {
          if (state.currentConfig[section] && typeof state.currentConfig[section] === 'object') {
            (state.currentConfig[section] as Record<string, unknown>)[property] = value;
          }
        }),

      // Render quality actions
      setRenderQuality: quality =>
        set(state => {
          state.renderQuality = quality;
        }),

      setPerformanceMode: mode =>
        set(state => {
          state.performanceMode = mode;

          // Auto-adjust quality based on mode
          if (mode === 'performance') {
            state.renderQuality = {
              textureResolution: 'low',
              shadowQuality: 'low',
              antiAliasing: false,
              postProcessing: false,
              maxTextures: 20,
              lodEnabled: true,
            };
            state.currentConfig.postProcessing.enabled = false;
            state.currentConfig.directional.shadows = false;
          } else if (mode === 'quality') {
            state.renderQuality = {
              textureResolution: 'ultra',
              shadowQuality: 'high',
              antiAliasing: true,
              postProcessing: true,
              maxTextures: 100,
              lodEnabled: false,
            };
            state.currentConfig.postProcessing.enabled = true;
            state.currentConfig.directional.shadows = true;
            state.currentConfig.directional.shadowMapSize = 4096;
          }
        }),

      updateFrameRate: fps =>
        set(state => {
          state.frameRate = fps;

          // Auto-optimize if performance is poor
          if (state.performanceMode === 'auto') {
            if (fps < 30 && state.renderQuality.textureResolution !== 'low') {
              // Reduce quality automatically
              state.renderQuality.textureResolution = 'low';
              state.renderQuality.shadowQuality = 'low';
              state.currentConfig.postProcessing.enabled = false;
            } else if (fps > 50 && state.renderQuality.textureResolution === 'low') {
              // Increase quality if performance allows
              state.renderQuality.textureResolution = 'medium';
              state.renderQuality.shadowQuality = 'medium';
              state.currentConfig.postProcessing.enabled = true;
            }
          }
        }),

      // UI controls
      toggleLightingPanel: () =>
        set(state => {
          state.isLightingPanelOpen = !state.isLightingPanelOpen;
        }),

      toggleMaterialEditor: () =>
        set(state => {
          state.isMaterialEditorOpen = !state.isMaterialEditorOpen;
        }),

      // Optimization actions
      optimizeForPerformance: () =>
        set(state => {
          state.performanceMode = 'performance';
          state.renderQuality = {
            textureResolution: 'low',
            shadowQuality: 'low',
            antiAliasing: false,
            postProcessing: false,
            maxTextures: 20,
            lodEnabled: true,
          };
          state.currentConfig = {
            ...lightingPresets.studio,
            postProcessing: {
              ...lightingPresets.studio.postProcessing,
              enabled: false,
            },
            directional: {
              ...lightingPresets.studio.directional,
              shadows: false,
              shadowMapSize: 512,
            },
          };
        }),

      resetToDefaults: () =>
        set(state => {
          state.currentConfig = defaultLightingConfig;
          state.renderQuality = defaultRenderQuality;
          state.performanceMode = 'auto';
          state.isLightingPanelOpen = false;
          state.isMaterialEditorOpen = false;
        }),
    }))
  )
);

// Performance monitoring hook
export function usePerformanceMonitor() {
  const updateFrameRate = useLightingStore(state => state.updateFrameRate);

  // This would be called from the render loop
  const reportFrameRate = (fps: number) => {
    updateFrameRate(fps);
  };

  return { reportFrameRate };
}
