import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock @/config/festival before importing the hook.
// useFestivalStorage reads FESTIVAL.id at call time to build the storage key.
vi.mock('@/config/festival', () => ({
  FESTIVAL: { id: 'mock-festival' },
}))

// Import after mock is registered
const { useFestivalStorage } = await import('@/hooks/use-festival-storage')

const PREFIX = 'mock-festival'

describe('useFestivalStorage — key namespacing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads nothing when localStorage is empty (returns initialValue)', async () => {
    const { result } = renderHook(() => useFestivalStorage('my-key', 'default'))
    await waitFor(() => {
      expect(result.current[0]).toBe('default')
    })
  })

  it('reads an existing value from localStorage using the prefixed key', async () => {
    localStorage.setItem(`${PREFIX}:my-key`, JSON.stringify('stored-value'))
    const { result } = renderHook(() => useFestivalStorage('my-key', 'default'))
    await waitFor(() => {
      expect(result.current[0]).toBe('stored-value')
    })
  })

  it('writes to localStorage under the festival-prefixed key', async () => {
    const { result } = renderHook(() => useFestivalStorage<string>('write-key', ''))
    act(() => {
      result.current[1]('new-value')
    })
    expect(localStorage.getItem(`${PREFIX}:write-key`)).toBe(JSON.stringify('new-value'))
  })

  it('does NOT write to the unprefixed key', async () => {
    const { result } = renderHook(() => useFestivalStorage<string>('isolated-key', ''))
    act(() => {
      result.current[1]('v')
    })
    expect(localStorage.getItem('isolated-key')).toBeNull()
  })

  it('different logical keys do not collide', async () => {
    const { result: a } = renderHook(() => useFestivalStorage<number>('counter-a', 0))
    const { result: b } = renderHook(() => useFestivalStorage<number>('counter-b', 0))
    act(() => { a.current[1](10) })
    act(() => { b.current[1](20) })
    expect(JSON.parse(localStorage.getItem(`${PREFIX}:counter-a`)!)).toBe(10)
    expect(JSON.parse(localStorage.getItem(`${PREFIX}:counter-b`)!)).toBe(20)
  })

  it('remove() deletes the value from localStorage and resets to initialValue', async () => {
    const { result } = renderHook(() => useFestivalStorage<string>('rm-key', 'init'))
    act(() => { result.current[1]('stored') })
    expect(localStorage.getItem(`${PREFIX}:rm-key`)).not.toBeNull()

    act(() => { result.current[2]() }) // call remove
    expect(localStorage.getItem(`${PREFIX}:rm-key`)).toBeNull()
    expect(result.current[0]).toBe('init')
  })

  it('functional updater receives the current value', async () => {
    const { result } = renderHook(() => useFestivalStorage<number>('count', 0))
    act(() => { result.current[1]((prev) => prev + 1) })
    act(() => { result.current[1]((prev) => prev + 1) })
    expect(result.current[0]).toBe(2)
    expect(JSON.parse(localStorage.getItem(`${PREFIX}:count`)!)).toBe(2)
  })

  it('works with object values', async () => {
    const initial = { name: 'Test', value: 0 }
    const { result } = renderHook(() => useFestivalStorage('obj-key', initial))
    act(() => { result.current[1]({ name: 'Updated', value: 42 }) })
    const stored = JSON.parse(localStorage.getItem(`${PREFIX}:obj-key`)!)
    expect(stored).toEqual({ name: 'Updated', value: 42 })
  })

  it('works with array values', async () => {
    const { result } = renderHook(() => useFestivalStorage<string[]>('arr-key', []))
    act(() => { result.current[1](['a', 'b', 'c']) })
    const stored = JSON.parse(localStorage.getItem(`${PREFIX}:arr-key`)!)
    expect(stored).toEqual(['a', 'b', 'c'])
  })

  it('gracefully uses initialValue when stored JSON is malformed', async () => {
    localStorage.setItem(`${PREFIX}:broken-key`, 'NOT_VALID_JSON{{{')
    const { result } = renderHook(() => useFestivalStorage('broken-key', 'fallback'))
    await waitFor(() => {
      // Should not throw; initialValue is used
      expect(result.current[0]).toBe('fallback')
    })
  })
})

describe('useFestivalStorage — cross-festival isolation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('a value written under mock-festival does not appear under another festival id', () => {
    const { result } = renderHook(() => useFestivalStorage<string>('shared-key', ''))
    act(() => { result.current[1]('sziget-value') })

    // Simulating another festival's key — should not exist
    expect(localStorage.getItem('other-festival:shared-key')).toBeNull()
    // Our prefixed key should exist
    expect(localStorage.getItem(`${PREFIX}:shared-key`)).toBe(JSON.stringify('sziget-value'))
  })
})
