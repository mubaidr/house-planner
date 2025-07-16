import { renderHook } from '@testing-library/react'
import { useCanvasControls } from '../src/hooks/useCanvasControls'

describe('useCanvasControls', () => {
  it('should initialize and provide control functions', () => {
    const { result } = renderHook(() => useCanvasControls())
    expect(result.current).toBeDefined()
  })
})
