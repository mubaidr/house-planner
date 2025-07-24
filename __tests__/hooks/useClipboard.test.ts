import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '@/hooks/useClipboard';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/historyStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

describe('useClipboard', () => {
  let mockAddWall: jest.Mock;
  let mockAddDoor: jest.Mock;
  let mockAddWindow: jest.Mock;
  let mockExecuteCommand: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAddWall = jest.fn();
    mockAddDoor = jest.fn();
    mockAddWindow = jest.fn();
    mockExecuteCommand = jest.fn();

    mockUseDesignStore.mockReturnValue({
      walls: [
        { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 250, materialId: 'mat-1', floorId: 'floor-1' }
      ],
      doors: [
        { id: 'door-1', x: 50, y: 0, width: 80, height: 200, wallId: 'wall-1', wallAngle: 0, isOpen: false, openAngle: 0, materialId: 'door-mat', floorId: 'floor-1' }
      ],
      windows: [
        { id: 'window-1', x: 25, y: 0, width: 60, height: 120, wallId: 'wall-1', wallAngle: 0, sillHeight: 90, materialId: 'window-mat', floorId: 'floor-1' }
      ],
      stairs: [],
      roofs: [],
      addWall: mockAddWall,
      updateWall: jest.fn(),
      removeWall: jest.fn(),
      addDoor: mockAddDoor,
      updateDoor: jest.fn(),
      removeDoor: jest.fn(),
      addWindow: mockAddWindow,
      updateWindow: jest.fn(),
      removeWindow: jest.fn(),
      addStair: jest.fn(),
      updateStair: jest.fn(),
      removeStair: jest.fn(),
      addRoof: jest.fn(),
      updateRoof: jest.fn(),
      removeRoof: jest.fn(),
      clearAll: jest.fn(),
      loadDesign: jest.fn(),
    });

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: false,
      canRedo: false,
      history: [],
      currentIndex: -1,
      clearHistory: jest.fn(),
    });
  });

  describe('copySelectedElements', () => {
    it('should copy selected elements to clipboard', async () => {
      const { result } = renderHook(() => useClipboard());
      
      const selectedIds = ['wall-1', 'door-1'];
      
      await act(async () => {
        await result.current.copySelectedElements(selectedIds);
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"type":"clipboard_data"')
      );
    });

    it('should handle empty selection', async () => {
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await result.current.copySelectedElements([]);
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"elements":[]')
      );
    });

    it('should filter out non-existent elements', async () => {
      const { result } = renderHook(() => useClipboard());
      
      const selectedIds = ['wall-1', 'non-existent-id', 'door-1'];
      
      await act(async () => {
        await result.current.copySelectedElements(selectedIds);
      });
      
      const clipboardData = JSON.parse(
        (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0]
      );
      
      expect(clipboardData.elements).toHaveLength(2); // Only wall-1 and door-1
    });
  });

  describe('pasteElements', () => {
    beforeEach(() => {
      const clipboardData = {
        type: 'clipboard_data',
        elements: [
          {
            type: 'wall',
            data: { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 250, materialId: 'mat-1', floorId: 'floor-1' }
          },
          {
            type: 'door',
            data: { id: 'door-1', x: 50, y: 0, width: 80, height: 200, wallId: 'wall-1', wallAngle: 0, isOpen: false, openAngle: 0, materialId: 'door-mat', floorId: 'floor-1' }
          }
        ]
      };
      
      (navigator.clipboard.readText as jest.Mock).mockResolvedValue(JSON.stringify(clipboardData));
    });

    it('should paste elements with offset', async () => {
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await result.current.pasteElements(10, 20);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'PASTE_ELEMENTS',
        execute: expect.any(Function),
        undo: expect.any(Function),
        description: 'Paste elements',
      });
    });

    it('should handle invalid clipboard data', async () => {
      (navigator.clipboard.readText as jest.Mock).mockResolvedValue('invalid json');
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await result.current.pasteElements(0, 0);
      });
      
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle empty clipboard', async () => {
      (navigator.clipboard.readText as jest.Mock).mockResolvedValue('');
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await result.current.pasteElements(0, 0);
      });
      
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle clipboard API errors', async () => {
      (navigator.clipboard.readText as jest.Mock).mockRejectedValue(new Error('Clipboard access denied'));
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await result.current.pasteElements(0, 0);
      });
      
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('duplicateElements', () => {
    it('should duplicate selected elements with offset', async () => {
      const { result } = renderHook(() => useClipboard());
      
      const selectedIds = ['wall-1', 'door-1'];
      
      await act(async () => {
        await result.current.duplicateElements(selectedIds, 20, 20);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'DUPLICATE_ELEMENTS',
        execute: expect.any(Function),
        undo: expect.any(Function),
        description: 'Duplicate elements',
      });
    });

    it('should handle empty selection for duplication', async () => {
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await result.current.duplicateElements([], 20, 20);
      });
      
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('canPaste', () => {
    it('should return true when valid clipboard data exists', async () => {
      const clipboardData = {
        type: 'clipboard_data',
        elements: [{ type: 'wall', data: {} }]
      };
      
      (navigator.clipboard.readText as jest.Mock).mockResolvedValue(JSON.stringify(clipboardData));
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        const canPaste = await result.current.canPaste();
        expect(canPaste).toBe(true);
      });
    });

    it('should return false when no valid clipboard data exists', async () => {
      (navigator.clipboard.readText as jest.Mock).mockResolvedValue('invalid');
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        const canPaste = await result.current.canPaste();
        expect(canPaste).toBe(false);
      });
    });

    it('should return false when clipboard is empty', async () => {
      (navigator.clipboard.readText as jest.Mock).mockResolvedValue('');
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        const canPaste = await result.current.canPaste();
        expect(canPaste).toBe(false);
      });
    });
  });

  describe('keyboard shortcuts', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should set up keyboard event listeners', () => {
      renderHook(() => useClipboard());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useClipboard());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});