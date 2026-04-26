import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHaptic } from '@/hooks/use-haptic'

// jsdom does not implement navigator.vibrate.
// We define it ourselves so the hook can detect and call it.
function mockVibrate() {
  const fn = vi.fn(() => true)
  Object.defineProperty(navigator, 'vibrate', {
    value: fn,
    configurable: true,
    writable: true,
  })
  return fn
}

function removeVibrate() {
  Object.defineProperty(navigator, 'vibrate', {
    value: undefined,
    configurable: true,
    writable: true,
  })
}

describe('useHaptic — when Vibration API is available', () => {
  let vibrateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vibrateMock = mockVibrate()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    removeVibrate()
  })

  it('lightTap calls navigator.vibrate with 20ms', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.lightTap()
    expect(vibrateMock).toHaveBeenCalledWith(20)
  })

  it('mediumTap calls navigator.vibrate with 30ms', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.mediumTap()
    expect(vibrateMock).toHaveBeenCalledWith(30)
  })

  it('favoriteTap calls navigator.vibrate with 40ms', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.favoriteTap()
    expect(vibrateMock).toHaveBeenCalledWith(40)
  })

  it('successBurst calls navigator.vibrate with [50, 30, 50]', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.successBurst()
    expect(vibrateMock).toHaveBeenCalledWith([50, 30, 50])
  })

  it('cancel calls navigator.vibrate with 0 to stop vibration', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.cancel()
    expect(vibrateMock).toHaveBeenCalledWith(0)
  })

  it('custom passes the given pattern directly to vibrate', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.custom([100, 50, 100, 50, 100])
    expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100, 50, 100])
  })

  it('custom accepts a single number pattern', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.custom(75)
    expect(vibrateMock).toHaveBeenCalledWith(75)
  })

  it('each method makes exactly one vibrate call', () => {
    const { result } = renderHook(() => useHaptic())
    result.current.lightTap()
    result.current.mediumTap()
    result.current.favoriteTap()
    expect(vibrateMock).toHaveBeenCalledTimes(3)
  })
})

describe('useHaptic — when Vibration API is NOT available', () => {
  beforeEach(() => removeVibrate())
  afterEach(() => removeVibrate())

  it('lightTap does not throw when vibration is unsupported', () => {
    const { result } = renderHook(() => useHaptic())
    expect(() => result.current.lightTap()).not.toThrow()
  })

  it('mediumTap does not throw when vibration is unsupported', () => {
    const { result } = renderHook(() => useHaptic())
    expect(() => result.current.mediumTap()).not.toThrow()
  })

  it('favoriteTap does not throw when vibration is unsupported', () => {
    const { result } = renderHook(() => useHaptic())
    expect(() => result.current.favoriteTap()).not.toThrow()
  })

  it('successBurst does not throw when vibration is unsupported', () => {
    const { result } = renderHook(() => useHaptic())
    expect(() => result.current.successBurst()).not.toThrow()
  })

  it('cancel does not throw when vibration is unsupported', () => {
    const { result } = renderHook(() => useHaptic())
    expect(() => result.current.cancel()).not.toThrow()
  })

  it('custom does not throw when vibration is unsupported', () => {
    const { result } = renderHook(() => useHaptic())
    expect(() => result.current.custom(50)).not.toThrow()
  })
})
