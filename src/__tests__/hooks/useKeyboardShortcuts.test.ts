import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useDesignStore } from '@/stores/designStore';

jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

describe('useKeyboardShortcuts', () => {
  const mockSetActiveTool = jest.fn();
  const mockRemoveWall = jest.fn();
  const mockRemoveDoor = jest.fn();
  const mockRemoveWindow = jest.fn();
  const mockRemoveStair = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockReturnValue({
      selectedElementId: null,
      selectedElementType: null,
      setActiveTool: mockSetActiveTool,
      removeWall: mockRemoveWall,
      removeDoor: mockRemoveDoor,
      removeWindow: mockRemoveWindow,
      removeStair: mockRemoveStair,
    });
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', jest.fn());
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

  it('activates door tool when D key is pressed', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'd' });
    document.dispatchEvent(event);
    
    expect(mockSetActiveTool).toHaveBeenCalledWith('add-door');
  });

  it('activates window tool when N key is pressed', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'n' });
    document.dispatchEvent(event);
    
    expect(mockSetActiveTool).toHaveBeenCalledWith('add-window');
  });

  it('deactivates tool when Escape key is pressed', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'escape' });
    document.dispatchEvent(event);
    
    expect(mockSetActiveTool).toHaveBeenCalledWith(null);
  });

  it('deletes selected wall when Delete key is pressed', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'wall-1',
      selectedElementType: 'wall',
      setActiveTool: mockSetActiveTool,
      removeWall: mockRemoveWall,
      removeDoor: mockRemoveDoor,
      removeWindow: mockRemoveWindow,
      removeStair: mockRemoveStair,
    });

    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    document.dispatchEvent(event);
    
    expect(mockRemoveWall).toHaveBeenCalledWith('wall-1');
  });

  it('ignores shortcuts when typing in input fields', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Create a mock input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    
    const event = new KeyboardEvent('keydown', { key: 'w' });
    Object.defineProperty(event, 'target', { value: input });
    
    document.dispatchEvent(event);
    
    expect(mockSetActiveTool).not.toHaveBeenCalled();
    
    document.body.removeChild(input);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});