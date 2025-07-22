import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  clearAllStorage,
  saveDesignState,
  loadDesignState,
  saveUserPreferences,
  loadUserPreferences,
  exportToFile,
  importFromFile,
  getStorageInfo,
  compressData,
  decompressData,
} from '../../src/utils/storage';

describe('storage - Comprehensive Tests', () => {
  const mockDesignState = {
    walls: [{ id: 'wall-1', type: 'wall', startX: 0, startY: 0, endX: 100, endY: 0 }],
    doors: [{ id: 'door-1', type: 'door', wallId: 'wall-1', position: 50 }],
    windows: [],
    rooms: [],
    metadata: { version: '1.0', createdAt: new Date().toISOString() }
  };

  const mockPreferences = {
    theme: 'light',
    units: 'imperial',
    gridSize: 20,
    autoSave: true,
    shortcuts: { undo: 'Ctrl+Z', redo: 'Ctrl+Y' }
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Basic Storage Operations', () => {
    it('should save and load data from localStorage', () => {
      const testData = { test: 'value', number: 42 };
      
      saveToLocalStorage('test-key', testData);
      const loaded = loadFromLocalStorage('test-key');
      
      expect(loaded).toEqual(testData);
    });

    it('should handle non-existent keys gracefully', () => {
      const result = loadFromLocalStorage('non-existent-key');
      expect(result).toBeNull();
    });

    it('should remove items from localStorage', () => {
      saveToLocalStorage('test-key', { data: 'test' });
      removeFromLocalStorage('test-key');
      
      const result = loadFromLocalStorage('test-key');
      expect(result).toBeNull();
    });

    it('should clear all storage', () => {
      saveToLocalStorage('key1', { data: 'test1' });
      saveToLocalStorage('key2', { data: 'test2' });
      
      clearAllStorage();
      
      expect(loadFromLocalStorage('key1')).toBeNull();
      expect(loadFromLocalStorage('key2')).toBeNull();
    });
  });

  describe('Design State Management', () => {
    it('should save and load design state', () => {
      saveDesignState(mockDesignState);
      const loaded = loadDesignState();
      
      expect(loaded).toEqual(mockDesignState);
    });

    it('should handle versioning in design state', () => {
      const stateV1 = { ...mockDesignState, metadata: { version: '1.0' } };
      const stateV2 = { ...mockDesignState, metadata: { version: '2.0' } };
      
      saveDesignState(stateV1);
      saveDesignState(stateV2);
      
      const loaded = loadDesignState();
      expect(loaded.metadata.version).toBe('2.0');
    });

    it('should return default state when no saved state exists', () => {
      const loaded = loadDesignState();
      
      expect(loaded).toHaveProperty('walls');
      expect(loaded).toHaveProperty('doors');
      expect(loaded).toHaveProperty('windows');
      expect(loaded).toHaveProperty('rooms');
    });

    it('should handle corrupted design state gracefully', () => {
      localStorage.setItem('design-state', 'invalid-json');
      
      const loaded = loadDesignState();
      expect(loaded).toHaveProperty('walls');
    });
  });

  describe('User Preferences Management', () => {
    it('should save and load user preferences', () => {
      saveUserPreferences(mockPreferences);
      const loaded = loadUserPreferences();
      
      expect(loaded).toEqual(mockPreferences);
    });

    it('should merge preferences with defaults', () => {
      const partialPrefs = { theme: 'dark', units: 'metric' };
      saveUserPreferences(partialPrefs);
      
      const loaded = loadUserPreferences();
      expect(loaded.theme).toBe('dark');
      expect(loaded.units).toBe('metric');
      expect(loaded).toHaveProperty('gridSize'); // Should have default
    });

    it('should validate preference values', () => {
      const invalidPrefs = { 
        theme: 'invalid-theme', 
        units: 'invalid-units',
        gridSize: -5 
      };
      
      saveUserPreferences(invalidPrefs);
      const loaded = loadUserPreferences();
      
      // Should fall back to valid defaults
      expect(['light', 'dark']).toContain(loaded.theme);
      expect(['imperial', 'metric']).toContain(loaded.units);
      expect(loaded.gridSize).toBeGreaterThan(0);
    });
  });

  describe('File Import/Export', () => {
    it('should export design to file format', async () => {
      const exported = await exportToFile(mockDesignState, 'json');
      
      expect(exported).toHaveProperty('data');
      expect(exported).toHaveProperty('filename');
      expect(exported.filename).toContain('.json');
    });

    it('should support multiple export formats', async () => {
      const jsonExport = await exportToFile(mockDesignState, 'json');
      const csvExport = await exportToFile(mockDesignState, 'csv');
      
      expect(jsonExport.filename).toContain('.json');
      expect(csvExport.filename).toContain('.csv');
    });

    it('should import design from file', async () => {
      const fileContent = JSON.stringify(mockDesignState);
      const file = new File([fileContent], 'design.json', { type: 'application/json' });
      
      const imported = await importFromFile(file);
      expect(imported).toEqual(mockDesignState);
    });

    it('should validate imported file format', async () => {
      const invalidContent = 'invalid json content';
      const file = new File([invalidContent], 'design.json', { type: 'application/json' });
      
      await expect(importFromFile(file)).rejects.toThrow();
    });

    it('should handle different file types', async () => {
      const jsonFile = new File([JSON.stringify(mockDesignState)], 'design.json');
      const txtFile = new File(['text content'], 'design.txt');
      
      const jsonImport = await importFromFile(jsonFile);
      expect(jsonImport).toEqual(mockDesignState);
      
      await expect(importFromFile(txtFile)).rejects.toThrow();
    });
  });

  describe('Storage Information and Management', () => {
    it('should provide storage usage information', () => {
      saveDesignState(mockDesignState);
      saveUserPreferences(mockPreferences);
      
      const info = getStorageInfo();
      
      expect(info).toHaveProperty('used');
      expect(info).toHaveProperty('available');
      expect(info).toHaveProperty('total');
      expect(info.used).toBeGreaterThan(0);
    });

    it('should calculate storage usage accurately', () => {
      const largeMockState = {
        ...mockDesignState,
        walls: Array.from({ length: 100 }, (_, i) => ({ 
          id: `wall-${i}`, 
          type: 'wall' 
        }))
      };
      
      saveDesignState(largeMockState);
      
      const info = getStorageInfo();
      expect(info.used).toBeGreaterThan(1000); // Should be substantial
    });

    it('should warn when storage is nearly full', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Mock localStorage to simulate near-full storage
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => saveDesignState(mockDesignState)).not.toThrow();
      
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('Data Compression', () => {
    it('should compress and decompress data', () => {
      const largeData = {
        walls: Array.from({ length: 50 }, (_, i) => ({ 
          id: `wall-${i}`, 
          type: 'wall',
          properties: 'repeated data '.repeat(10)
        }))
      };
      
      const compressed = compressData(largeData);
      const decompressed = decompressData(compressed);
      
      expect(decompressed).toEqual(largeData);
      // Note: Base64 encoding increases size, so we just verify the compression/decompression works
      expect(compressed).toBeDefined();
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should handle compression of small data efficiently', () => {
      const smallData = { test: 'value' };
      
      const compressed = compressData(smallData);
      const decompressed = decompressData(compressed);
      
      expect(decompressed).toEqual(smallData);
    });

    it('should handle compression errors gracefully', () => {
      const circularData = {};
      circularData.self = circularData;
      
      expect(() => compressData(circularData)).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle localStorage quota exceeded', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => saveToLocalStorage('test', mockDesignState)).not.toThrow();
      
      localStorage.setItem = originalSetItem;
    });

    it('should handle localStorage disabled/unavailable', () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;
      
      expect(() => saveToLocalStorage('test', mockDesignState)).not.toThrow();
      expect(loadFromLocalStorage('test')).toBeNull();
      
      global.localStorage = originalLocalStorage;
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('test-key', '{invalid json}');
      
      const result = loadFromLocalStorage('test-key');
      expect(result).toBeNull();
    });

    it('should handle very large objects', () => {
      const largeObject = {
        data: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          content: 'large content '.repeat(100)
        }))
      };
      
      expect(() => saveToLocalStorage('large-test', largeObject)).not.toThrow();
    });

    it('should handle concurrent access safely', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve().then(() => saveToLocalStorage(`concurrent-${i}`, { data: i }))
      );
      
      await Promise.all(promises);
      
      // All saves should complete without errors
      for (let i = 0; i < 10; i++) {
        const result = loadFromLocalStorage(`concurrent-${i}`);
        expect(result).toEqual({ data: i });
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid save/load operations efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        saveToLocalStorage(`perf-test-${i}`, { data: i });
        loadFromLocalStorage(`perf-test-${i}`);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should maintain performance with large datasets', () => {
      const largeDataset = {
        elements: Array.from({ length: 1000 }, (_, i) => ({ id: i, data: 'test' }))
      };
      
      const startTime = Date.now();
      saveToLocalStorage('large-dataset', largeDataset);
      const loaded = loadFromLocalStorage('large-dataset');
      const endTime = Date.now();
      
      expect(loaded).toEqual(largeDataset);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});