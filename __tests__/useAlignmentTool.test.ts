import { renderHook, act } from '@testing-library/react'
import { useAlignmentTool } from '../src/hooks/useAlignmentTool'

describe('useAlignmentTool', () => {
  it('should initialize and provide alignment functions', () => {
    const { result } = renderHook(() => useAlignmentTool())
    expect(result.current).toBeDefined()
    expect(typeof result.current.alignLeftElements).toBe('function')
    expect(typeof result.current.alignRightElements).toBe('function')
    expect(typeof result.current.alignTopElements).toBe('function')
    expect(typeof result.current.alignBottomElements).toBe('function')
    expect(typeof result.current.alignCenterHorizontalElements).toBe('function')
    expect(typeof result.current.alignCenterVerticalElements).toBe('function')
    expect(typeof result.current.distributeHorizontallyElements).toBe('function')
    expect(typeof result.current.distributeVerticallyElements).toBe('function')
    expect(typeof result.current.getAlignmentGuides).toBe('function')
  })
})
