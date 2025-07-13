import { useEffect } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { autoSave } from '@/utils/storage';

export const useAutoSave = (intervalMs: number = 30000) => {
  const { walls, doors, windows, stairs, roofs } = useDesignStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const designData = { walls, doors, windows, stairs, roofs };
      
      // Only auto-save if there's actual content
      if (walls.length > 0 || doors.length > 0 || windows.length > 0 || stairs.length > 0 || roofs.length > 0) {
        autoSave(designData);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [walls, doors, windows, stairs, roofs, intervalMs]);
};