import { DesignState } from '@/stores/designStore';

export interface SavedDesign {
  id: string;
  name: string;
  timestamp: number;
  data: Pick<DesignState, 'walls' | 'doors' | 'windows'>;
}

const STORAGE_KEY = 'house-planner-designs';
const AUTO_SAVE_KEY = 'house-planner-autosave';

export const saveDesign = (name: string, data: Pick<DesignState, 'walls' | 'doors' | 'windows'>): string => {
  const designs = getSavedDesigns();
  const id = Date.now().toString();
  
  const newDesign: SavedDesign = {
    id,
    name,
    timestamp: Date.now(),
    data,
  };
  
  designs.push(newDesign);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  
  return id;
};

export const loadDesign = (id: string): SavedDesign | null => {
  const designs = getSavedDesigns();
  return designs.find(design => design.id === id) || null;
};

export const getSavedDesigns = (): SavedDesign[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteDesign = (id: string): void => {
  const designs = getSavedDesigns().filter(design => design.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
};

export const autoSave = (data: Pick<DesignState, 'walls' | 'doors' | 'windows'>): void => {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  } catch {
    // Ignore storage errors
  }
};

export const loadAutoSave = (): Pick<DesignState, 'walls' | 'doors' | 'windows'> | null => {
  try {
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
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