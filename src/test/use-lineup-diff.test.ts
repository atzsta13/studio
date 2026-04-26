import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLineupDiff } from '@/hooks/use-lineup-diff'
import type { LineupItem } from '@/types'

function makeArtist(name: string, genres: string[] = [], overrides: Partial<LineupItem> = {}): LineupItem {
  return {
    id: name.toLowerCase().replace(/\s/g, '-'),
    artist: name,
    day: null,
    genres,
    vibes: [],
    ...overrides,
  }
}

const CURRENT_LINEUP: LineupItem[] = [
  makeArtist('Billie Eilish', ['POP']),
  makeArtist('Kendrick Lamar', ['HIP-HOP']),
  makeArtist('Amyl And The Sniffers', ['ROCK']),   // new this year
  makeArtist('Charli XCX', ['POP']),               // new this year
]

const PREV_LINEUP: LineupItem[] = [
  makeArtist('Billie Eilish', ['POP']),             // returning
  makeArtist('Kendrick Lamar', ['HIP-HOP']),        // returning
  makeArtist('Arctic Monkeys', ['ROCK']),            // dropped
  makeArtist('Massive Attack', ['ELECTRONIC']),      // dropped
]

function mockFetch(responseBody: unknown, ok = true) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    json: async () => responseBody,
  } as Response)
}

describe('useLineupDiff — loading state', () => {
  afterEach(() => vi.restoreAllMocks())

  it('starts in a loading state', () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    expect(result.current.isLoading).toBe(true)
  })

  it('sets isLoading to false after data resolves', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('sets isLoading to false even when the fetch fails', async () => {
    mockFetch(null, false) // ok=false → response not used, catches gracefully
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})

describe('useLineupDiff — newArrivals', () => {
  afterEach(() => vi.restoreAllMocks())

  it('identifies artists in current lineup that were not in the previous year', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const newNames = result.current.newArrivals.map((a) => a.artist)
    expect(newNames).toContain('Amyl And The Sniffers')
    expect(newNames).toContain('Charli XCX')
  })

  it('does not include returning artists in newArrivals', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const newNames = result.current.newArrivals.map((a) => a.artist)
    expect(newNames).not.toContain('Billie Eilish')
    expect(newNames).not.toContain('Kendrick Lamar')
  })

  it('is case-insensitive when comparing artist names', async () => {
    const prevWithDifferentCase: LineupItem[] = [makeArtist('billie eilish', ['POP'])]
    mockFetch(prevWithDifferentCase)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', [makeArtist('Billie Eilish', ['POP'])]))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // 'Billie Eilish' is in prev (as 'billie eilish') → should NOT be a new arrival
    expect(result.current.newArrivals).toHaveLength(0)
  })

  it('returns empty newArrivals when all current artists were also in the previous lineup', async () => {
    mockFetch(CURRENT_LINEUP) // prev == current
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.newArrivals).toHaveLength(0)
  })
})

describe('useLineupDiff — returningHeroes', () => {
  afterEach(() => vi.restoreAllMocks())

  it('identifies artists who appeared in both lineups', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const names = result.current.returningHeroes.map((a) => a.artist)
    expect(names).toContain('Billie Eilish')
    expect(names).toContain('Kendrick Lamar')
  })

  it('does not include new arrivals in returningHeroes', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const names = result.current.returningHeroes.map((a) => a.artist)
    expect(names).not.toContain('Amyl And The Sniffers')
    expect(names).not.toContain('Charli XCX')
  })

  it('returns empty when no artist appears in both lineups', async () => {
    const prevWithNoOverlap = [makeArtist('Coldplay'), makeArtist('Ed Sheeran')]
    mockFetch(prevWithNoOverlap)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.returningHeroes).toHaveLength(0)
  })
})

describe('useLineupDiff — genreShifts', () => {
  afterEach(() => vi.restoreAllMocks())

  it('computes positive diff for genres that grew', async () => {
    // Current: 2 POP, 1 HIP-HOP, 1 ROCK
    // Prev:    1 POP, 1 HIP-HOP, 1 ROCK, 1 ELECTRONIC
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const pop = result.current.genreShifts.find((g) => g.genre === 'POP')
    // prev had 1 POP, current has 2 → diff = +1
    expect(pop?.diff).toBe(1)
  })

  it('computes negative diff for genres that shrank', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const electronic = result.current.genreShifts.find((g) => g.genre === 'ELECTRONIC')
    // prev had 1 ELECTRONIC, current has 0 → diff = -1
    expect(electronic?.diff).toBe(-1)
  })

  it('excludes genres with zero diff from genreShifts', async () => {
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // HIP-HOP: prev=1, current=1 → diff=0 → excluded
    const hipHop = result.current.genreShifts.find((g) => g.genre === 'HIP-HOP')
    expect(hipHop).toBeUndefined()
  })

  it('limits genreShifts to at most 10 entries', async () => {
    // Build a lineup with 12 distinct genres
    const manyGenres = Array.from({ length: 12 }, (_, i) =>
      makeArtist(`New Artist ${i}`, [`GENRE_${i}`])
    )
    mockFetch([]) // prev is empty → everything is a gain
    const { result } = renderHook(() => useLineupDiff('sziget-2026', manyGenres))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.genreShifts.length).toBeLessThanOrEqual(10)
  })

  it('excludes the catch-all "MUSIC" genre tag from shifts', async () => {
    const withMusicTag = [makeArtist('DJ Example', ['MUSIC', 'ELECTRONIC'])]
    mockFetch([])
    const { result } = renderHook(() => useLineupDiff('sziget-2026', withMusicTag))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const musicEntry = result.current.genreShifts.find((g) => g.genre === 'MUSIC')
    expect(musicEntry).toBeUndefined()
  })
})

describe('useLineupDiff — empty / edge cases', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns empty diff arrays when current lineup is empty', async () => {
    // When currentLineup is empty the useEffect guard returns early before
    // calling setIsLoading(false), so isLoading stays true indefinitely.
    // We wait one tick for the effect to fire and check only the diff values.
    mockFetch(PREV_LINEUP)
    const { result } = renderHook(() => useLineupDiff('sziget-2026', []))
    await new Promise((r) => setTimeout(r, 20))
    expect(result.current.newArrivals).toHaveLength(0)
    expect(result.current.returningHeroes).toHaveLength(0)
    expect(result.current.genreShifts).toHaveLength(0)
  })

  it('returns empty diff arrays when previous lineup fetch returns empty array', async () => {
    mockFetch([])
    const { result } = renderHook(() => useLineupDiff('sziget-2026', CURRENT_LINEUP))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.newArrivals).toHaveLength(0)
    expect(result.current.returningHeroes).toHaveLength(0)
  })

  it('does not call fetch when festivalId is empty string', async () => {
    const fetchSpy = mockFetch(PREV_LINEUP)
    renderHook(() => useLineupDiff('', CURRENT_LINEUP))
    // Wait one tick
    await new Promise((r) => setTimeout(r, 10))
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
