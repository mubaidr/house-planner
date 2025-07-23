import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage, clearAllStorage, saveDesignState, loadDesignState, saveUserPreferences, loadUserPreferences, exportToFile, importFromFile, getStorageInfo, compressData, decompressData, autoSave, loadAutoSave, saveDesign, loadDesign } from '@/utils/storage';
import { useDesignStore } from '@/stores/designStore';
import { useErrorStore } from '@/stores/errorStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
      (localStorageMock as any).length = Object.keys(store).length;
    },
    removeItem: (key: string) => {
      delete store[key];
      (localStorageMock as any).length = Object.keys(store).length;
    },
    clear: () => {
      store = {};
      (localStorageMock as any).length = 0;
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Zustand stores
jest.mock('@/stores/designStore', () => ({
  useDesignStore: {
    getState: jest.fn(() => ({ walls: [], doors: [], windows: [] })),
    setState: jest.fn(),
  },
}));

const mockSetError = jest.fn();
jest.mock('@/stores/errorStore', () => ({
  useErrorStore: {
    getState: jest.fn(() => ({
      setError: mockSetError
    })),
  },
}));

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // Test localStorage operations
  it('should save data to localStorage', () => {
    saveToLocalStorage('testKey', { name: 'test' });
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify({ name: 'test' }));
  });

  it('should load data from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify({ name: 'test' }));
    const data = loadFromLocalStorage('testKey');
    expect(data).toEqual({ name: 'test' });
  });

  it('should remove data from localStorage', () => {
    localStorage.setItem('testKey', 'value');
    removeFromLocalStorage('testKey');
    expect(localStorage.getItem('testKey')).toBeNull();
  });

  it('should clear all data from localStorage', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    clearAllStorage();
    expect(localStorage.getItem('key1')).toBeNull();
    expect(localStorage.getItem('key2')).toBeNull();
  });

  // Test design state management
  it('should save design state', () => {
    const designState = { walls: [{ id: 'w1' }], doors: [], windows: [] };
    saveDesignState(designState);
    expect(localStorage.getItem('design-state')).toBe(JSON.stringify(designState));
  });

  it('should load design state', () => {
    const designState = { walls: [{ id: 'w1' }], doors: [], windows: [] };
    localStorage.setItem('design-state', JSON.stringify(designState));
    const loadedState = loadDesignState();
    expect(loadedState.walls[0].id).toBe('w1');
  });

  it('should return default design state if nothing is saved', () => {
    const loadedState = loadDesignState();
    expect(loadedState.walls).toEqual([]);
    expect(loadedState.metadata).toBeDefined();
  });

  // Test user preferences management
  it('should save user preferences', () => {
    const preferences = { theme: 'dark', units: 'metric' };
    saveUserPreferences(preferences);
    const expectedPrefs = {
      theme: 'dark',
      units: 'metric',
      gridSize: 20,
      autoSave: true,
      shortcuts: { undo: 'Ctrl+Z', redo: 'Ctrl+Y' },
    };
    expect(localStorage.getItem('user-preferences')).toBe(JSON.stringify(expectedPrefs));
  });

  it('should load user preferences', () => {
    const preferences = { theme: 'dark', units: 'metric' };
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
    const loadedPrefs = loadUserPreferences();
    expect(loadedPrefs.theme).toBe('dark');
    expect(loadedPrefs.units).toBe('metric');
  });

  it('should return default user preferences if nothing is saved', () => {
    const loadedPrefs = loadUserPreferences();
    expect(loadedPrefs.theme).toBe('light');
    expect(loadedPrefs.units).toBe('imperial');
  });

  it('should validate user preferences when saving', () => {
    const preferences = { theme: 'invalid', units: 'badunit', gridSize: -10 };
    saveUserPreferences(preferences);
    const loadedPrefs = loadUserPreferences();
    expect(loadedPrefs.theme).toBe('light'); // Should revert to default
    expect(loadedPrefs.units).toBe('imperial'); // Should revert to default
    expect(loadedPrefs.gridSize).toBe(20); // Should revert to default
  });

  // Test file import/export
  it('should export data to file in JSON format', async () => {
    const data = { test: 'data' };
    const { data: exportedData, filename } = await exportToFile(data, 'json');
    expect(exportedData).toBe(JSON.stringify(data, null, 2));
    expect(filename).toMatch(/^design-export-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.\d{3}Z\.json$/);
  });

  it('should import data from a file', async () => {
    const fileContent = JSON.stringify({ imported: 'data' });
    const mockFile = new File([fileContent], 'test.json', { type: 'application/json' });

    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn((file: File) => {
        // Simulate async read
        mockFileReader.onload!({ target: { result: fileContent } } as ProgressEvent<FileReader>);
      }),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
    };
    jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const importedData = await importFromFile(mockFile);
    expect(importedData).toEqual({ imported: 'data' });
  });

  it('should handle import errors', async () => {
    const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' });

    const mockFileReader = {
      readAsText: jest.fn((file: File) => {
        mockFileReader.onerror!({} as ProgressEvent<FileReader>);
      }),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
    };
    jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    await expect(importFromFile(mockFile)).rejects.toThrow('Failed to read file');
  });

  it('should handle invalid JSON during import', async () => {
    const fileContent = 'not json';
    const mockFile = new File([fileContent], 'test.json', { type: 'application/json' });

    const mockFileReader = {
      readAsText: jest.fn((file: File) => {
        mockFileReader.onload!({ target: { result: fileContent } } as ProgressEvent<FileReader>);
      }),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
    };
    jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    await expect(importFromFile(mockFile)).rejects.toThrow('Invalid file format');
  });

  // Test storage information
  it('should return storage info', () => {
    localStorage.setItem('test1', 'abc');
    localStorage.setItem('test2', 'defg');
    const info = getStorageInfo();
    // Lengths of keys + values: (5 + 3) + (5 + 4) = 8 + 9 = 17
    expect(info.used).toBe(17);
    expect(info.total).toBe(5 * 1024 * 1024);
    expect(info.available).toBe(info.total - info.used);
  });

  // Test data compression
  it('should compress and decompress data', () => {
    const data = { a: 1, b: 'hello', c: [1, 2, 3] };
    const compressed = compressData(data);
    const decompressed = decompressData(compressed);
    expect(decompressed).toEqual(data);
  });

  it('should handle circular references during compression', () => {
    const obj: any = {};
    obj.a = obj;
    const compressed = compressData(obj);
    const decompressed = decompressData(compressed);
    expect(decompressed).toEqual({ a: '[Circular Reference]' });
  });

  it('should handle invalid compressed data during decompression', () => {
    expect(() => decompressData('invalid base64')).toThrow('Failed to decompress data');
  });

  // Test auto-save functionality
  it('should auto-save design data', () => {
    const designData = { walls: [{ id: 'w1' }] };
    autoSave(designData as any);
    const stored = JSON.parse(localStorage.getItem('house-planner-autosave') || '{}');
    expect(stored.data).toEqual(designData);
    expect(stored.timestamp).toBeDefined();
  });

  it('should load auto-saved design data if recent', () => {
    const designData = { walls: [{ id: 'w1' }] };
    const timestamp = Date.now();
    localStorage.setItem('house-planner-autosave', JSON.stringify({ timestamp, data: designData }));
    const loadedData = loadAutoSave();
    expect(loadedData).toEqual(designData);
  });

  it('should not load auto-saved design data if too old', () => {
    const designData = { walls: [{ id: 'w1' }] };
    const timestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    localStorage.setItem('house-planner-autosave', JSON.stringify({ timestamp, data: designData }));
    const loadedData = loadAutoSave();
    expect(loadedData).toBeNull();
  });

  it('should handle errors during auto-save load', () => {
    localStorage.setItem('house-planner-autosave', 'invalid json');
    const loadedData = loadAutoSave();
    expect(loadedData).toBeNull();
  });

  // Test saveDesign and loadDesign (requires mocking File System Access API)
  describe('File System Access API', () => {
    const mockDesignState = { walls: [{ id: 'mockWall' }], doors: [], windows: [] };
    const mockFileContent = JSON.stringify(mockDesignState, null, 2);

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      // Mock window.showSaveFilePicker
      Object.defineProperty(window, 'showSaveFilePicker', {
        writable: true,
        value: jest.fn(() =>
          Promise.resolve({
            createWritable: jest.fn(() =>
              Promise.resolve({
                write: jest.fn(),
                close: jest.fn(),
              })
            ),
          })
        ),
      });

      // Mock window.showOpenFilePicker
      Object.defineProperty(window, 'showOpenFilePicker', {
        writable: true,
        value: jest.fn(() =>
          Promise.resolve([
            {
              getFile: jest.fn(() =>
                Promise.resolve({
                  text: jest.fn(() => Promise.resolve(mockFileContent)),
                })
              ),
            },
          ])
        ),
      });
    });

    it('should save design using File System Access API', async () => {
      (useDesignStore.getState as jest.Mock).mockReturnValue(mockDesignState);
      await saveDesign();
      expect(window.showSaveFilePicker).toHaveBeenCalled();
      const handle = await (window.showSaveFilePicker as jest.Mock).mock.results[0].value;
      const writable = await handle.createWritable.mock.results[0].value;
      expect(writable.write).toHaveBeenCalledWith(expect.any(Blob));
      expect(writable.close).toHaveBeenCalled();
    });

    it('should handle save design errors', async () => {
      (window.showSaveFilePicker as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Save error')));
      await saveDesign();
      expect(mockSetError).toHaveBeenCalledWith('Failed to save design.');
    });

    it('should load design using File System Access API', async () => {
      await loadDesign();
      expect(window.showOpenFilePicker).toHaveBeenCalled();
      expect(useDesignStore.setState).toHaveBeenCalledWith(mockDesignState);
    });

    it('should handle load design errors', async () => {
      (window.showOpenFilePicker as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Load error')));
      await loadDesign();
      expect(mockSetError).toHaveBeenCalledWith('Failed to load design.');
    });
  });
});