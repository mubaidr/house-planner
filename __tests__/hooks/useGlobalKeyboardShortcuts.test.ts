
import { renderHook } from '@testing-library/react';
import { useGlobalKeyboardShortcuts } from '@/hooks/useGlobalKeyboardShortcuts';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useUIStore } from '@/stores/uiStore';
import * as storage from '@/utils/storage';

jest.mock('@/stores/designStore');
jest.mock('@/stores/historyStore');
jest.mock('@/stores/uiStore');
jest.mock('@/utils/storage');

describe('useGlobalKeyboardShortcuts', () => {
  const mockUseDesignStore = useDesignStore as jest.Mock;
  const mockUseHistoryStore = useHistoryStore as jest.Mock;
  const mockUseUIStore = useUIStore as jest.Mock;
  const mockSaveDesign = storage.saveDesign as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDesignStore.mockReturnValue({});
    mockUseHistoryStore.mockReturnValue({
      undo: jest.fn(),
      redo: jest.fn(),
    });
    mockUseUIStore.mockReturnValue({
      setExportDialogOpen: jest.fn(),
    });
  });

  it('should call saveDesign on Ctrl+S', () => {
    renderHook(() => useGlobalKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);

    expect(mockSaveDesign).toHaveBeenCalled();
  });

  it('should call historyStore.undo on Ctrl+Z', () => {
    const { undo } = mockUseHistoryStore();
    renderHook(() => useGlobalKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
    window.dispatchEvent(event);

    expect(undo).toHaveBeenCalled();
  });

  it('should call historyStore.redo on Ctrl+Shift+Z', () => {
    const { redo } = mockUseHistoryStore();
    renderHook(() => useGlobalKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
    window.dispatchEvent(event);

    expect(redo).toHaveBeenCalled();
  });

  it('should call uiStore.setExportDialogOpen on Ctrl+E', () => {
    const { setExportDialogOpen } = mockUseUIStore();
    renderHook(() => useGlobalKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', { key: 'e', ctrlKey: true });
    window.dispatchEvent(event);

    expect(setExportDialogOpen).toHaveBeenCalledWith(true);
  });

  it('should not trigger shortcut if input-like element is focused', () => {
    renderHook(() => useGlobalKeyboardShortcuts());

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);

    expect(mockSaveDesign).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
