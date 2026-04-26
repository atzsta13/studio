import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClashResolver } from '@/hooks/use-clash-resolver'
import type { LineupItem } from '@/types'

function makeArtist(id: string, overrides: Partial<LineupItem> = {}): LineupItem {
  return {
    id,
    artist: `Artist ${id}`,
    day: 'Friday',
    startTime: null,
    endTime: null,
    genres: [],
    vibes: [],
    ...overrides,
  }
}

// Helpers for readable time strings
const t = (hh: number, mm = 0) =>
  `2026-08-01T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`

describe('useClashResolver', () => {
  it('returns no clashes for an empty favorites list', () => {
    const { result } = renderHook(() => useClashResolver([]))
    expect(result.current).toEqual([])
  })

  it('returns no clashes for a single artist', () => {
    const a = makeArtist('1', { startTime: t(18), endTime: t(20) })
    const { result } = renderHook(() => useClashResolver([a]))
    expect(result.current).toEqual([])
  })

  it('detects a direct overlap between two artists on the same day', () => {
    const a = makeArtist('1', { day: 'Friday', startTime: t(18), endTime: t(20) })
    const b = makeArtist('2', { day: 'Friday', startTime: t(19), endTime: t(21) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toHaveLength(1)
    expect(result.current[0]).toEqual({ a, b })
  })

  it('detects containment (one set fully inside the other)', () => {
    const a = makeArtist('1', { day: 'Saturday', startTime: t(17), endTime: t(21) })
    const b = makeArtist('2', { day: 'Saturday', startTime: t(18), endTime: t(20) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toHaveLength(1)
  })

  it('does not clash for adjacent (back-to-back) slots', () => {
    // 18:00–20:00 and 20:00–22:00 share only the boundary → no overlap
    const a = makeArtist('1', { day: 'Friday', startTime: t(18), endTime: t(20) })
    const b = makeArtist('2', { day: 'Friday', startTime: t(20), endTime: t(22) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toEqual([])
  })

  it('does not clash for artists on different days', () => {
    const a = makeArtist('1', { day: 'Friday', startTime: t(18), endTime: t(20) })
    const b = makeArtist('2', { day: 'Saturday', startTime: t(18), endTime: t(20) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toEqual([])
  })

  it('skips artists with null startTime or endTime', () => {
    const a = makeArtist('1', { day: 'Friday', startTime: null, endTime: null })
    const b = makeArtist('2', { day: 'Friday', startTime: t(18), endTime: t(20) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toEqual([])
  })

  it('treats two null-day artists with overlapping times as a clash (null === null)', () => {
    // In the current dataset stage/day are always null. The algorithm uses
    // `a.day === b.day` which evaluates null === null → true, so any two
    // artists with time data will clash. This test documents that behaviour.
    const a = makeArtist('1', { day: null, startTime: t(18), endTime: t(20) })
    const b = makeArtist('2', { day: null, startTime: t(18), endTime: t(20) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toHaveLength(1)
  })

  it('finds multiple independent clashes in a larger list', () => {
    const a = makeArtist('a', { day: 'Friday', startTime: t(18), endTime: t(20) })
    const b = makeArtist('b', { day: 'Friday', startTime: t(19), endTime: t(21) }) // clashes with a
    const c = makeArtist('c', { day: 'Friday', startTime: t(21), endTime: t(23) })
    const d = makeArtist('d', { day: 'Friday', startTime: t(22), endTime: t(24) }) // clashes with c
    const { result } = renderHook(() => useClashResolver([a, b, c, d]))
    expect(result.current).toHaveLength(2)
  })

  it('finds all pairwise clashes when three artists all overlap', () => {
    const a = makeArtist('a', { day: 'Friday', startTime: t(18), endTime: t(22) })
    const b = makeArtist('b', { day: 'Friday', startTime: t(19), endTime: t(23) })
    const c = makeArtist('c', { day: 'Friday', startTime: t(20), endTime: t(24) })
    const { result } = renderHook(() => useClashResolver([a, b, c]))
    // a-b, a-c, b-c all clash
    expect(result.current).toHaveLength(3)
  })

  it('does not produce duplicate clash pairs (a,b) and (b,a)', () => {
    const a = makeArtist('a', { day: 'Friday', startTime: t(18), endTime: t(20) })
    const b = makeArtist('b', { day: 'Friday', startTime: t(19), endTime: t(21) })
    const { result } = renderHook(() => useClashResolver([a, b]))
    // Should be exactly one pair, not two
    expect(result.current).toHaveLength(1)
  })

  it('handles midnight crossover (late-night slots)', () => {
    // 23:00–01:00 and 00:00–02:00 on same day string
    const a = makeArtist('a', { day: 'Friday', startTime: '2026-08-01T23:00:00', endTime: '2026-08-02T01:00:00' })
    const b = makeArtist('b', { day: 'Friday', startTime: '2026-08-02T00:00:00', endTime: '2026-08-02T02:00:00' })
    const { result } = renderHook(() => useClashResolver([a, b]))
    expect(result.current).toHaveLength(1)
  })
})
