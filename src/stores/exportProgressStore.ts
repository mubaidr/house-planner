import { create } from 'zustand';

export interface ExportProgressState {
  isExporting: boolean;
  progress: number; // 0-100
  currentItem: string;
  totalItems: number;
  completedItems: number;
  errorMessage: string | null;
  exportResults: Array<{
    name: string;
    success: boolean;
    error?: string;
  }>;
}

export interface ExportProgressActions {
  startExport: (totalItems: number) => void;
  updateProgress: (progress: number, currentItem: string) => void;
  incrementCompleted: (itemName: string, success: boolean, error?: string) => void;
  setError: (error: string) => void;
  finishExport: () => void;
  resetProgress: () => void;
}

const initialState: ExportProgressState = {
  isExporting: false,
  progress: 0,
  currentItem: '',
  totalItems: 0,
  completedItems: 0,
  errorMessage: null,
  exportResults: [],
};

export const useExportProgressStore = create<ExportProgressState & ExportProgressActions>((set, get) => ({
  ...initialState,

  startExport: (totalItems) => set({
    isExporting: true,
    progress: 0,
    currentItem: '',
    totalItems,
    completedItems: 0,
    errorMessage: null,
    exportResults: [],
  }),

  updateProgress: (progress, currentItem) => set({
    progress: Math.min(100, Math.max(0, progress)),
    currentItem,
  }),

  incrementCompleted: (itemName, success, error) => {
    const state = get();
    const completedItems = state.completedItems + 1;
    const progress = Math.round((completedItems / state.totalItems) * 100);
    
    set({
      completedItems,
      progress,
      exportResults: [
        ...state.exportResults,
        {
          name: itemName,
          success,
          error,
        },
      ],
    });
  },

  setError: (error) => set({ errorMessage: error }),

  finishExport: () => set({
    isExporting: false,
    progress: 100,
    currentItem: 'Export completed',
  }),

  resetProgress: () => set(initialState),
}));
