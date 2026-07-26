import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  BASE_COL_PX,
  BASE_PX_PER_MIN,
  GUTTER_PX,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  anchoredScroll,
  clampZoom,
  densityTier,
  fitWidthZoom,
  fitZoom,
  useTimetableZoom,
} from '@/hooks/use-timetable-zoom'

describe('clampZoom', () => {
  it('keeps in-range values untouched', () => {
    expect(clampZoom(1)).toBe(1)
    expect(clampZoom(0.5)).toBe(0.5)
  })

  it('clamps to the zoom bounds', () => {
    expect(clampZoom(0.001)).toBe(MIN_ZOOM)
    expect(clampZoom(99)).toBe(MAX_ZOOM)
  })

  it('falls back to 1 for non-finite input', () => {
    expect(clampZoom(NaN)).toBe(1)
    expect(clampZoom(Infinity)).toBe(1)
  })
})

describe('anchoredScroll', () => {
  it('keeps the minute under the focal point in place when zooming in', () => {
    // Focal point 300px down the viewport, already scrolled 600px: the content
    // point is at 900px, which must land at 1800px after a 2x zoom.
    const next = anchoredScroll({
      prevZoom: 1,
      nextZoom: 2,
      focalX: 0,
      focalY: 300,
      scrollLeft: 0,
      scrollTop: 600,
    })
    expect(next.scrollTop).toBe(1500) // 1800 - 300
  })

  it('excludes the fixed gutter from the horizontal anchor', () => {
    const next = anchoredScroll({
      prevZoom: 1,
      nextZoom: 2,
      focalX: GUTTER_PX + 100,
      focalY: 0,
      scrollLeft: 0,
      scrollTop: 0,
      gutterPx: GUTTER_PX,
    })
    // Content x = 100 → 200 after 2x; keeping it under the same focal point
    // means scrolling by exactly the 100px of growth.
    expect(next.scrollLeft).toBe(100)
  })

  it('never returns negative offsets', () => {
    const next = anchoredScroll({
      prevZoom: 2,
      nextZoom: 0.5,
      focalX: 10,
      focalY: 10,
      scrollLeft: 0,
      scrollTop: 0,
    })
    expect(next.scrollLeft).toBeGreaterThanOrEqual(0)
    expect(next.scrollTop).toBeGreaterThanOrEqual(0)
  })

  it('is a no-op when the zoom does not change', () => {
    const next = anchoredScroll({
      prevZoom: 1.5,
      nextZoom: 1.5,
      focalX: 120,
      focalY: 400,
      scrollLeft: 250,
      scrollTop: 800,
    })
    expect(next).toEqual({ scrollLeft: 250, scrollTop: 800 })
  })
})

describe('fitZoom', () => {
  it('picks the axis that constrains the view (height here)', () => {
    // 18 Sziget stages in 1200px would allow 0.34; 16 hours in 600px allows less.
    const zoom = fitZoom({
      containerWidth: 1200,
      containerHeight: 600,
      stageCount: 18,
      totalMinutes: 16 * 60,
      headerPx: 44,
    })
    const heightFit = (600 - 44) / (16 * 60 * BASE_PX_PER_MIN)
    expect(zoom).toBeCloseTo(clampZoom(heightFit), 5)
  })

  it('fits the full board inside the container at the returned zoom', () => {
    const args = { containerWidth: 1000, containerHeight: 5000, stageCount: 5, totalMinutes: 600 }
    const zoom = fitZoom(args)
    expect(GUTTER_PX + args.stageCount * BASE_COL_PX * zoom).toBeLessThanOrEqual(args.containerWidth + 0.001)
  })

  it('clamps to the floor when the board is far larger than the container', () => {
    expect(fitZoom({ containerWidth: 400, containerHeight: 300, stageCount: 30, totalMinutes: 2000 })).toBe(MIN_ZOOM)
  })

  it('leaves the zoom alone when the container has not been laid out yet', () => {
    expect(fitZoom({ containerWidth: 0, containerHeight: 0, stageCount: 18, totalMinutes: 960 })).toBe(1)
  })
})

describe('fitWidthZoom', () => {
  it('makes every stage column fit exactly', () => {
    const zoom = fitWidthZoom(1052, 5)
    expect(zoom).toBeCloseTo(1, 5)
  })

  it('returns 1 when there is nothing to fit', () => {
    expect(fitWidthZoom(800, 0)).toBe(1)
    expect(fitWidthZoom(10, 3)).toBe(1)
  })
})

describe('densityTier', () => {
  it('maps rendered height, not duration, to a layout tier', () => {
    expect(densityTier(12)).toBe('tiny')
    expect(densityTier(45)).toBe('tiny')
    expect(densityTier(46)).toBe('small')
    expect(densityTier(77)).toBe('small')
    expect(densityTier(78)).toBe('full')
    expect(densityTier(400)).toBe('full')
  })
})

describe('useTimetableZoom', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts at the initial zoom and reports no stored preference', async () => {
    const { result } = renderHook(() => useTimetableZoom('sziget-2026'))
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.zoom).toBe(1)
    expect(result.current.hadStored).toBe(false)
  })

  it('restores a persisted zoom for the festival', async () => {
    localStorage.setItem('sziget-2026-timetable-zoom', '0.75')
    const { result } = renderHook(() => useTimetableZoom('sziget-2026'))
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.zoom).toBe(0.75)
    expect(result.current.hadStored).toBe(true)
  })

  it('does not leak zoom between festivals', async () => {
    localStorage.setItem('sziget-2026-timetable-zoom', '0.5')
    const { result } = renderHook(() => useTimetableZoom('frequency-2026'))
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.zoom).toBe(1)
  })

  it('persists and clamps zoom changes', async () => {
    const { result } = renderHook(() => useTimetableZoom('sziget-2026'))
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    act(() => result.current.setZoom(z => z * ZOOM_STEP))
    expect(result.current.zoom).toBeCloseTo(ZOOM_STEP, 5)
    expect(localStorage.getItem('sziget-2026-timetable-zoom')).toBe(String(ZOOM_STEP))

    act(() => result.current.setZoom(0))
    expect(result.current.zoom).toBe(MIN_ZOOM)

    act(() => result.current.setZoom(z => z / ZOOM_STEP))
    expect(result.current.zoom).toBe(MIN_ZOOM)
  })

  it('ignores a corrupt stored value', async () => {
    localStorage.setItem('sziget-2026-timetable-zoom', 'not-a-number')
    const { result } = renderHook(() => useTimetableZoom('sziget-2026'))
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.zoom).toBe(1)
    expect(result.current.hadStored).toBe(false)
  })
})
