import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHydration } from '@/hooks/use-hydration'

const KEY = (id: string) => `${id}_hydration_v1`

describe('useHydration — initial state', () => {
  beforeEach(() => localStorage.clear())

  it('starts at zero when localStorage has no saved value', async () => {
    const { result } = renderHook(() => useHydration('test-festival'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.waterCount).toBe(0)
  })

  it('restores a previously saved count from localStorage', async () => {
    localStorage.setItem(KEY('test-festival'), '5')
    const { result } = renderHook(() => useHydration('test-festival'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.waterCount).toBe(5)
  })

  it('uses "default" as the key prefix when no festivalId is given', async () => {
    localStorage.setItem(KEY('default'), '3')
    const { result } = renderHook(() => useHydration(undefined))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.waterCount).toBe(3)
  })
})

describe('useHydration — addWater', () => {
  beforeEach(() => localStorage.clear())

  it('increments the count by 1', async () => {
    const { result } = renderHook(() => useHydration('test'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    act(() => { result.current.addWater() })
    expect(result.current.waterCount).toBe(1)
  })

  it('increments correctly on multiple calls', async () => {
    const { result } = renderHook(() => useHydration('test'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    act(() => { result.current.addWater() })
    act(() => { result.current.addWater() })
    act(() => { result.current.addWater() })
    expect(result.current.waterCount).toBe(3)
  })

  it('persists the updated count to localStorage', async () => {
    const { result } = renderHook(() => useHydration('test'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    act(() => { result.current.addWater() })
    act(() => { result.current.addWater() })
    expect(localStorage.getItem(KEY('test'))).toBe('2')
  })
})

describe('useHydration — resetWater', () => {
  beforeEach(() => localStorage.clear())

  it('resets the count back to zero', async () => {
    const { result } = renderHook(() => useHydration('test'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    act(() => { result.current.addWater() })
    act(() => { result.current.addWater() })
    act(() => { result.current.resetWater() })
    expect(result.current.waterCount).toBe(0)
  })

  it('persists the reset (zero) to localStorage', async () => {
    const { result } = renderHook(() => useHydration('test'))
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    act(() => { result.current.addWater() })
    act(() => { result.current.resetWater() })
    expect(localStorage.getItem(KEY('test'))).toBe('0')
  })
})

describe('useHydration — festival isolation', () => {
  beforeEach(() => localStorage.clear())

  it('two instances with different festivalIds do not share state', async () => {
    localStorage.setItem(KEY('sziget'), '4')
    localStorage.setItem(KEY('area53'), '7')

    const { result: sziget } = renderHook(() => useHydration('sziget'))
    const { result: area53 } = renderHook(() => useHydration('area53'))

    await waitFor(() => expect(sziget.current.isLoaded).toBe(true))
    await waitFor(() => expect(area53.current.isLoaded).toBe(true))

    expect(sziget.current.waterCount).toBe(4)
    expect(area53.current.waterCount).toBe(7)
  })

  it('writing to one instance does not affect the other', async () => {
    const { result: a } = renderHook(() => useHydration('festival-a'))
    const { result: b } = renderHook(() => useHydration('festival-b'))

    await waitFor(() => expect(a.current.isLoaded).toBe(true))
    await waitFor(() => expect(b.current.isLoaded).toBe(true))

    act(() => { a.current.addWater() })

    expect(a.current.waterCount).toBe(1)
    expect(b.current.waterCount).toBe(0)
  })
})
