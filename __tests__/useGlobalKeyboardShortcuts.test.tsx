// __tests__/useGlobalKeyboardShortcuts.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useGlobalKeyboardShortcuts } from '@/hooks/useGlobalKeyboardShortcuts';

describe('useGlobalKeyboardShortcuts', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('invokes Save shortcut (Ctrl+S)', () => {
    renderHook(() => useGlobalKeyboardShortcuts());
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(event);
    });
    expect(console.log).toHaveBeenCalledWith('Save triggered');
  });

  it('invokes Undo shortcut (Ctrl+Z)', () => {
    renderHook(() => useGlobalKeyboardShortcuts());
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      window.dispatchEvent(event);
    });
    expect(console.log).toHaveBeenCalledWith('Undo triggered');
  });

  it('invokes Redo shortcut (Ctrl+Shift+Z)', () => {
    renderHook(() => useGlobalKeyboardShortcuts());
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
      window.dispatchEvent(event);
    });
    expect(console.log).toHaveBeenCalledWith('Redo triggered');
  });

  it('invokes Export shortcut (Ctrl+E)', () => {
    renderHook(() => useGlobalKeyboardShortcuts());
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'e', ctrlKey: true });
      window.dispatchEvent(event);
    });
    expect(console.log).toHaveBeenCalledWith('Export dialog triggered');
  });

  it('does not invoke shortcut for unrelated keys', () => {
    renderHook(() => useGlobalKeyboardShortcuts());
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true });
      window.dispatchEvent(event);
    });
    expect(console.log).not.toHaveBeenCalled();
  });
});
