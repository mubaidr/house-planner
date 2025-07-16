import { renderHook } from '@testing-library/react'
import { useAutoSave } from '../src/hooks/useAutoSave'

describe('useAutoSave', () => {
  it('should initialize without errors', () => {
    const { result } = renderHook(() => useAutoSave(1000))
    expect(result.current).toBeUndefined()
  })
})
