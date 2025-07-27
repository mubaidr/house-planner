import { useDesignStore, DesignState } from '@/stores/designStore';
import { handleError } from '@/utils/errorHandler';

// Basic localStorage operations
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('localStorage save failed'), {
      category: 'storage',
      source: 'storage.saveToLocalStorage',
      operation: 'save',
      additionalData: { key }
    }, {
      userMessage: 'Failed to save data locally. Your browser storage may be full.',
      suggestions: ['Clear browser storage', 'Try incognito mode', 'Check available space']
    });
  }
};

export const loadFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('localStorage load failed'), {
      category: 'storage',
      source: 'storage.loadFromLocalStorage',
      operation: 'load',
      additionalData: { key }
    }, {
      userMessage: 'Failed to load saved data. The data may be corrupted.',
      suggestions: ['Clear browser storage', 'Try refreshing the page', 'Check browser settings']
    });
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('localStorage remove failed'), {
      category: 'storage',
      source: 'storage.removeFromLocalStorage',
      operation: 'remove',
      additionalData: { key }
    }, {
      userMessage: 'Failed to remove data from local storage.',
      severity: 'warning'
    });
  }
};

export const clearAllStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('localStorage clear failed'), {
      category: 'storage',
      source: 'storage.clearAllStorage',
      operation: 'clear'
    }, {
      userMessage: 'Failed to clear all local storage data.',
      severity: 'warning'
    });
  }
};

// Design state management
export const saveDesignState = (state: any): void => {
  saveToLocalStorage('design-state', state);
};

export const loadDesignState = (): any => {
  const saved = loadFromLocalStorage('design-state');
  if (saved) {
    return saved;
  }
  // Return default state
  return {
    walls: [],
    doors: [],
    windows: [],
    rooms: [],
    metadata: { version: '1.0', createdAt: new Date().toISOString() }
  };
};

// User preferences management
const defaultPreferences = {
  theme: 'light',
  units: 'imperial',
  gridSize: 20,
  autoSave: true,
  shortcuts: { undo: 'Ctrl+Z', redo: 'Ctrl+Y' }
};

export const saveUserPreferences = (preferences: any): void => {
  // Validate and merge with defaults
  const validatedPrefs = {
    ...defaultPreferences,
    ...preferences,
    theme: ['light', 'dark'].includes(preferences.theme) ? preferences.theme : defaultPreferences.theme,
    units: ['imperial', 'metric'].includes(preferences.units) ? preferences.units : defaultPreferences.units,
    gridSize: preferences.gridSize > 0 ? preferences.gridSize : defaultPreferences.gridSize
  };
  saveToLocalStorage('user-preferences', validatedPrefs);
};

export const loadUserPreferences = (): any => {
  const saved = loadFromLocalStorage('user-preferences');
  return saved ? { ...defaultPreferences, ...saved } : defaultPreferences;
};

// File import/export
export const exportToFile = async (data: any, format: string): Promise<{ data: string; filename: string }> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `design-export-${timestamp}.${format}`;

  let exportData: string;
  switch (format) {
    case 'json':
      exportData = JSON.stringify(data, null, 2);
      break;
    default:
      exportData = JSON.stringify(data, null, 2);
  }

  return { data: exportData, filename };
};

export const importFromFile = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Storage information
export const getStorageInfo = (): { used: number; available: number; total: number } => {
  try {
    let used = 0;

    // Calculate used storage by iterating through all keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // Estimate total available storage (5MB is typical for localStorage)
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const available = total - used;

    return { used, available, total };
  } catch {
    return { used: 0, available: 0, total: 0 };
  }
};

// Data compression (simple implementation)
export const compressData = (data: any): string => {
  try {
    // Handle circular references by using a replacer function with a Set to track seen objects
    const seen = new Set();
    const jsonString = JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    });

    // Simple compression - remove JSON formatting whitespace and encode
    // In a real implementation, you might use a proper compression library like pako
    const compactJson = JSON.stringify(JSON.parse(jsonString)); // Remove formatting whitespace
    try {
      return btoa(compactJson);
    } catch {
      return compactJson;
    }
  } catch {
    // Return a safe fallback for circular references or other JSON errors
    return btoa('{}');
  }
};

export const decompressData = (compressedData: string): any => {
  try {
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  } catch {
    // Fallback - try to parse as regular JSON
    try {
      return JSON.parse(compressedData);
    } catch {
      throw new Error('Failed to decompress data');
    }
  }
};

export const saveDesign = async () => {
  try {
    const design = useDesignStore.getState();
    const designData = JSON.stringify(design, null, 2);
    const blob = new Blob([designData], { type: 'application/json' });

    const handle = await window.showSaveFilePicker({
      suggestedName: 'house-plan.json',
      types: [
        {
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Design save failed'), {
      category: 'save',
      source: 'storage.saveDesign',
      operation: 'saveFile'
    }, {
      userMessage: 'Failed to save your design file. Please try again or save to a different location.',
      retryAction: () => saveDesign(),
      suggestions: [
        'Try saving to a different location',
        'Check available disk space',
        'Ensure you have write permissions'
      ]
    });
  }
};

export const loadDesign = async () => {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
    });

    const file = await handle.getFile();
    const contents = await file.text();
    const design = JSON.parse(contents);

    useDesignStore.setState(design);
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Design load failed'), {
      category: 'load',
      source: 'storage.loadDesign',
      operation: 'loadFile'
    }, {
      userMessage: 'Failed to load the design file. The file may be corrupted or in an unsupported format.',
      retryAction: () => loadDesign(),
      suggestions: [
        'Verify the file is a valid design file',
        'Try opening a different file',
        'Check if the file was created with this application'
      ]
    });
  }
};

export const autoSave = (data: Pick<DesignState, 'walls' | 'doors' | 'windows'>): void => {
  try {
    localStorage.setItem('house-planner-autosave', JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  } catch {
    // Ignore storage errors
  }
};

export const loadAutoSave = (): Pick<DesignState, 'walls' | 'doors' | 'windows'> | null => {
  try {
    const stored = localStorage.getItem('house-planner-autosave');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only load if autosave is less than 24 hours old
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
};
