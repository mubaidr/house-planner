import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const mockSetActiveTool = jest.fn();
const mockRemoveWall = jest.fn();

jest.mock('@/stores/designStore', () => ({
  useDesignStore: jest.fn(() => ({
    selectedElementId: null,
    selectedElementType: null,
    setActiveTool: mockSetActiveTool,
    removeWall: mockRemoveWall,
    removeDoor: jest.fn(),
    removeWindow: jest.fn(),
    removeStair: jest.fn(),
  })),
}));

describe('useKeyboardShortcuts - Simple Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets up keyboard event listeners', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    renderHook(() => useKeyboardShortcuts());
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
  });

  it('activates wall tool when W key is pressed', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'w' });
    document.dispatchEvent(event);
    
    expect(mockSetActiveTool).toHaveBeenCalledWith('wall');
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});