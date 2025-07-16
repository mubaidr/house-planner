import { useDesignStore, DesignState } from '@/stores/designStore';
import { useErrorStore } from '@/stores/errorStore';

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
    console.error('Error saving design:', error);
    useErrorStore.getState().setError('Failed to save design.');
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
    console.error('Error loading design:', error);
    useErrorStore.getState().setError('Failed to load design.');
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