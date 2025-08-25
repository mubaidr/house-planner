import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as THREE from 'three';
import { Export3DSystem } from '../utils/3d/export3D';
import { PDFExportSystem } from '../utils/3d/pdfExport';

// Mock Three.js exporters
jest.mock('three/examples/jsm/exporters/GLTFExporter.js', () => ({
  GLTFExporter: jest.fn().mockImplementation(() => ({
    parse: jest.fn((scene, onComplete, onError, options) => {
      // Simulate successful export
      setTimeout(() => {
        onComplete({ scenes: [{}], nodes: [], materials: [] });
      }, 100);
    })
  }))
}));

jest.mock('three/examples/jsm/exporters/OBJExporter.js', () => ({
  OBJExporter: jest.fn().mockImplementation(() => ({
    parse: jest.fn(() => 'v 0.0 0.0 0.0\nf 1 2 3')
  }))
}));

// Mock pdfMake
jest.mock('pdfmake/build/pdfmake', () => ({
  createPdf: jest.fn(() => ({
    getBlob: jest.fn((callback) => {
      callback(new Blob(['mock pdf'], { type: 'application/pdf' }));
    })
  }))
}));

jest.mock('pdfmake/build/vfs_fonts', () => ({
  pdfMake: { vfs: {} }
}));

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

describe('Phase 5: Export & Integration', () => {
  let export3DSystem: Export3DSystem;
  let pdfExportSystem: PDFExportSystem;
  let mockScene: THREE.Scene;
  let mockCamera: THREE.Camera;
  let mockRenderer: THREE.WebGLRenderer;

  beforeEach(() => {
    // Create mock Three.js objects
    mockScene = new THREE.Scene();
    mockCamera = new THREE.PerspectiveCamera();
    
    // Mock renderer with required methods
    mockRenderer = {
      getPixelRatio: jest.fn(() => 1),
      setPixelRatio: jest.fn(),
      getSize: jest.fn(() => new THREE.Vector2(800, 600)),
      setSize: jest.fn(),
      shadowMap: {
        enabled: false,
        type: THREE.PCFShadowMap,
        mapSize: { width: 1024, height: 1024, setScalar: jest.fn() }
      },
      toneMapping: THREE.NoToneMapping,
      toneMappingExposure: 1,
      render: jest.fn(),
      domElement: document.createElement('canvas')
    } as any;

    // Initialize systems
    export3DSystem = new Export3DSystem();
    export3DSystem.setRenderer(mockRenderer);
    
    pdfExportSystem = new PDFExportSystem();
    pdfExportSystem.setRenderer(mockRenderer);

    // Add some test objects to scene
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.userData = { type: 'wall', start: { x: 0, z: 0 }, end: { x: 5, z: 0 } };
    mockScene.add(cube);
  });

  describe('3D Model Export', () => {
    it('should export GLTF format successfully', async () => {
      const blob = await export3DSystem.exportGLTF(mockScene);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should export OBJ format successfully', async () => {
      const blob = await export3DSystem.exportOBJ(mockScene);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
    });

    it('should handle GLTF export with binary option', async () => {
      const blob = await export3DSystem.exportGLTF(mockScene, { binary: true });
      
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle export errors gracefully', async () => {
      // Mock an error scenario
      const errorSystem = new Export3DSystem();
      
      await expect(errorSystem.exportGLTF(mockScene)).rejects.toThrow();
    });
  });

  describe('High-Quality Rendering', () => {
    beforeEach(() => {
      // Mock canvas methods
      Object.defineProperty(mockRenderer.domElement, 'toBlob', {
        value: jest.fn((callback) => {
          callback(new Blob(['mock image'], { type: 'image/png' }));
        })
      });
    });

    it('should export high-quality screenshot', async () => {
      const blob = await export3DSystem.exportHighQualityRender(
        mockScene,
        mockCamera,
        { width: 1920, height: 1080 }
      );
      
      expect(blob).toBeInstanceOf(Blob);
      expect(mockRenderer.setPixelRatio).toHaveBeenCalledWith(2);
      expect(mockRenderer.setSize).toHaveBeenCalledWith(1920, 1080);
    });

    it('should restore original renderer settings after export', async () => {
      const originalPixelRatio = 1;
      const originalSize = new THREE.Vector2(800, 600);
      
      (mockRenderer.getPixelRatio as jest.Mock).mockReturnValue(originalPixelRatio);
      (mockRenderer.getSize as jest.Mock).mockReturnValue(originalSize);

      await export3DSystem.exportHighQualityRender(mockScene, mockCamera);
      
      // Should restore original settings
      expect(mockRenderer.setPixelRatio).toHaveBeenLastCalledWith(originalPixelRatio);
      expect(mockRenderer.setSize).toHaveBeenLastCalledWith(originalSize.x, originalSize.y);
    });

    it('should handle different image formats', async () => {
      const formats = ['png', 'jpeg', 'webp'] as const;
      
      for (const format of formats) {
        const blob = await export3DSystem.exportHighQualityRender(
          mockScene,
          mockCamera,
          { format }
        );
        expect(blob).toBeInstanceOf(Blob);
      }
    });
  });

  describe('2D Floor Plan Generation', () => {
    beforeEach(() => {
      // Add room data to scene
      const room = new THREE.Object3D();
      room.userData = {
        type: 'room',
        name: 'Living Room',
        points: [
          { x: 0, z: 0 },
          { x: 5, z: 0 },
          { x: 5, z: 4 },
          { x: 0, z: 4 }
        ]
      };
      mockScene.add(room);
    });

    it('should generate 2D floor plan', async () => {
      const blob = await export3DSystem.export2DFloorPlan(mockScene);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should include dimensions when requested', async () => {
      const blob = await export3DSystem.export2DFloorPlan(mockScene, {
        showDimensions: true,
        showLabels: true
      });
      
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle empty scene gracefully', async () => {
      const emptyScene = new THREE.Scene();
      const blob = await export3DSystem.export2DFloorPlan(emptyScene);
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('Professional PDF Export', () => {
    const mockProjectInfo = {
      title: 'Test House Design',
      projectName: 'Test Project',
      clientName: 'Test Client',
      architect: 'Test Architect',
      date: '2025-01-01',
      scale: '1:100'
    };

    it('should create professional PDF with all sections', async () => {
      const blob = await pdfExportSystem.exportProfessionalDrawing(
        mockScene,
        mockCamera,
        mockProjectInfo
      );
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    it('should handle PDF export with custom options', async () => {
      const blob = await pdfExportSystem.exportProfessionalDrawing(
        mockScene,
        mockCamera,
        mockProjectInfo,
        {
          includeFloorPlan: true,
          include3DViews: true,
          includeMaterials: false,
          pageSize: 'A4',
          orientation: 'portrait'
        }
      );
      
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should generate PDF with minimal content when options disabled', async () => {
      const blob = await pdfExportSystem.exportProfessionalDrawing(
        mockScene,
        mockCamera,
        mockProjectInfo,
        {
          includeFloorPlan: false,
          include3DViews: false,
          includeMaterials: false
        }
      );
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('Export Performance', () => {
    it('should complete GLTF export within reasonable time', async () => {
      const startTime = performance.now();
      
      await export3DSystem.exportGLTF(mockScene);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds for test scene
      expect(duration).toBeLessThan(5000);
    });

    it('should handle large scenes efficiently', async () => {
      // Add many objects to test performance
      for (let i = 0; i < 100; i++) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mockScene.add(mesh);
      }

      const startTime = performance.now();
      await export3DSystem.exportOBJ(mockScene);
      const endTime = performance.now();
      
      // Should still complete within reasonable time
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle renderer not set error', async () => {
      const systemWithoutRenderer = new Export3DSystem();
      
      await expect(
        systemWithoutRenderer.exportHighQualityRender(mockScene, mockCamera)
      ).rejects.toThrow('Renderer not set');
    });

    it('should handle canvas context errors', async () => {
      // Mock canvas without 2D context
      const mockCanvas = {
        getContext: jest.fn(() => null),
        width: 800,
        height: 600
      } as any;

      await expect(
        export3DSystem.exportScreenshot(mockCanvas)
      ).rejects.toThrow('Could not get 2D context');
    });

    it('should handle blob creation failures', async () => {
      const mockCanvas = {
        getContext: jest.fn(() => ({
          fillStyle: '',
          fillRect: jest.fn(),
          drawImage: jest.fn()
        })),
        toBlob: jest.fn((callback) => callback(null)),
        width: 800,
        height: 600
      } as any;

      await expect(
        export3DSystem.exportScreenshot(mockCanvas)
      ).rejects.toThrow('Failed to create blob');
    });
  });

  describe('Integration Tests', () => {
    it('should export multiple formats from same scene', async () => {
      const gltfBlob = await export3DSystem.exportGLTF(mockScene);
      const objBlob = await export3DSystem.exportOBJ(mockScene);
      const imageBlob = await export3DSystem.exportHighQualityRender(mockScene, mockCamera);
      const floorPlanBlob = await export3DSystem.export2DFloorPlan(mockScene);

      expect(gltfBlob).toBeInstanceOf(Blob);
      expect(objBlob).toBeInstanceOf(Blob);
      expect(imageBlob).toBeInstanceOf(Blob);
      expect(floorPlanBlob).toBeInstanceOf(Blob);
    });

    it('should maintain scene integrity during exports', async () => {
      const originalChildCount = mockScene.children.length;
      
      await export3DSystem.exportGLTF(mockScene);
      await export3DSystem.exportOBJ(mockScene);
      
      // Scene should remain unchanged
      expect(mockScene.children.length).toBe(originalChildCount);
    });
  });
});

describe('Export System Integration', () => {
  it('should provide consistent API across all export types', () => {
    const exportSystem = new Export3DSystem();
    const pdfSystem = new PDFExportSystem();

    // Check that all expected methods exist
    expect(typeof exportSystem.exportGLTF).toBe('function');
    expect(typeof exportSystem.exportOBJ).toBe('function');
    expect(typeof exportSystem.exportScreenshot).toBe('function');
    expect(typeof exportSystem.exportHighQualityRender).toBe('function');
    expect(typeof exportSystem.export2DFloorPlan).toBe('function');
    expect(typeof pdfSystem.exportProfessionalDrawing).toBe('function');
  });

  it('should handle renderer setup correctly', () => {
    const exportSystem = new Export3DSystem();
    const mockRenderer = {} as THREE.WebGLRenderer;

    expect(() => exportSystem.setRenderer(mockRenderer)).not.toThrow();
  });
});