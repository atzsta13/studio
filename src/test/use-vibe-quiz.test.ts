import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVibeQuiz } from '@/hooks/use-vibe-quiz'
import type { LineupItem } from '@/types'

function makeArtist(
  id: string,
  genres: string[],
  vibes: string[],
  overrides: Partial<LineupItem> = {}
): LineupItem {
  return { id, artist: id, day: null, genres, vibes, ...overrides }
}

const ROCK_HIGH_ENERGY = makeArtist('rock-1', ['ROCK'], ['High Energy', 'Anthemic'])
const ELECTRONIC_DANCE = makeArtist('elec-1', ['ELECTRONIC'], ['Dance', 'Flow'])
const TECHNO_RAVE = makeArtist('techno-1', ['TECHNO'], ['Dance', 'Hard', 'Rave'])
const INDIE_CHILL = makeArtist('indie-1', ['INDIE'], ['Feel-good', 'Nostalgic'])
const JAZZ_CHILL = makeArtist('jazz-1', ['JAZZ'], ['Chill', 'Flow'])
const NO_VIBES = makeArtist('blank-1', ['POP'], [])

const FULL_LINEUP = [
  ROCK_HIGH_ENERGY,
  ELECTRONIC_DANCE,
  TECHNO_RAVE,
  INDIE_CHILL,
  JAZZ_CHILL,
  NO_VIBES,
]

describe('useVibeQuiz — initial state', () => {
  it('starts at step 0', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    expect(result.current.state.step).toBe(0)
  })

  it('starts with no energy selected', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    expect(result.current.state.energy).toBe('')
  })

  it('starts with no genres selected', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    expect(result.current.state.selectedGenres.size).toBe(0)
  })

  it('starts with no moodTag selected', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    expect(result.current.state.moodTag).toBe('')
  })

  it('starts with wildcards off', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    expect(result.current.state.wildcards).toBe(false)
  })

  it('starts with empty results', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    expect(result.current.results).toEqual([])
  })
})

describe('useVibeQuiz — navigation', () => {
  it('nextStep increments the step', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.nextStep() })
    expect(result.current.state.step).toBe(1)
  })

  it('nextStep does not exceed step 4', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    for (let i = 0; i < 10; i++) {
      act(() => { result.current.nextStep() })
    }
    expect(result.current.state.step).toBe(4)
  })

  it('prevStep decrements the step', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    act(() => { result.current.prevStep() })
    expect(result.current.state.step).toBe(1)
  })

  it('prevStep does not go below step 0', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.prevStep() })
    act(() => { result.current.prevStep() })
    expect(result.current.state.step).toBe(0)
  })
})

describe('useVibeQuiz — genre selection', () => {
  it('toggleGenre adds a genre', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.toggleGenre('ROCK') })
    expect(result.current.state.selectedGenres.has('ROCK')).toBe(true)
  })

  it('toggleGenre removes an already-selected genre', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.toggleGenre('ROCK') })
    expect(result.current.state.selectedGenres.has('ROCK')).toBe(false)
  })

  it('allows selecting exactly 2 genres', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.toggleGenre('ELECTRONIC') })
    expect(result.current.state.selectedGenres.size).toBe(2)
  })

  it('silently ignores a 3rd genre when 2 are already selected', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.toggleGenre('ELECTRONIC') })
    act(() => { result.current.toggleGenre('TECHNO') })
    expect(result.current.state.selectedGenres.size).toBe(2)
    expect(result.current.state.selectedGenres.has('TECHNO')).toBe(false)
  })

  it('can deselect one of two genres and select a different one', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.toggleGenre('ELECTRONIC') })
    act(() => { result.current.toggleGenre('ROCK') }) // remove
    act(() => { result.current.toggleGenre('TECHNO') }) // add
    expect(result.current.state.selectedGenres.has('ELECTRONIC')).toBe(true)
    expect(result.current.state.selectedGenres.has('TECHNO')).toBe(true)
    expect(result.current.state.selectedGenres.has('ROCK')).toBe(false)
  })
})

describe('useVibeQuiz — computeResults', () => {
  // computeResults reads state via useCallback closure. State setters must
  // complete their render cycle before computeResults is called — hence the
  // separate act() calls below.

  it('does nothing when energy is missing', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.setMoodTag('EUPHORIC') })
    act(() => { result.current.computeResults() })
    expect(result.current.results).toEqual([])
  })

  it('does nothing when genres are missing', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    expect(result.current.results).toEqual([])
  })

  it('does nothing when moodTag is missing', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.computeResults() })
    expect(result.current.results).toEqual([])
  })

  it('returns results when all required fields are set', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    expect(result.current.results.length).toBeGreaterThan(0)
  })

  it('ranks genre-matching artists higher than non-genre-matching artists', () => {
    // UNHINGED/ROCK/HARD: rock-1 gets genre bonus (+2) + vibe bonus; elec-1 gets vibe only.
    // rock-1 score > elec-1 score → rock-1 must appear earlier in results.
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    const ids = result.current.results.map((a) => a.id)
    expect(ids).toContain('rock-1')
    expect(ids).toContain('elec-1')
    expect(ids.indexOf('rock-1')).toBeLessThan(ids.indexOf('elec-1'))
  })

  it('returns at least 4 results as a fallback even if no artists score > 0', () => {
    // Artists with empty vibes and no genre match → score 0 for all → fallback
    const minimalLineup = [
      makeArtist('x1', ['AMBIENT'], []),
      makeArtist('x2', ['AMBIENT'], []),
      makeArtist('x3', ['AMBIENT'], []),
      makeArtist('x4', ['AMBIENT'], []),
      makeArtist('x5', ['AMBIENT'], []),
    ]
    const { result } = renderHook(() => useVibeQuiz(minimalLineup))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('METAL') }) // no METAL artists → zero genre score
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    // Nothing scored > 0 → fallback slices top 4
    expect(result.current.results.length).toBe(4)
  })

  it('caps results at 8 when many artists match', () => {
    const bigLineup = Array.from({ length: 20 }, (_, i) =>
      makeArtist(`rock-${i}`, ['ROCK'], ['High Energy'])
    )
    const { result } = renderHook(() => useVibeQuiz(bigLineup))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    expect(result.current.results.length).toBeLessThanOrEqual(8)
  })

  it('wildcards=true produces a non-null result (randomness does not crash)', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('CHILL') })
    act(() => { result.current.toggleGenre('INDIE') })
    act(() => { result.current.setMoodTag('NOSTALGIC') })
    act(() => { result.current.setWildcards(true) })
    act(() => { result.current.computeResults() })
    expect(result.current.results.length).toBeGreaterThan(0)
  })
})

describe('useVibeQuiz — reset', () => {
  it('reset clears all state and results', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('ROCK') })
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    act(() => { result.current.reset() })

    expect(result.current.state.step).toBe(0)
    expect(result.current.state.energy).toBe('')
    expect(result.current.state.selectedGenres.size).toBe(0)
    expect(result.current.state.moodTag).toBe('')
    expect(result.current.state.wildcards).toBe(false)
    expect(result.current.results).toEqual([])
  })
})

describe('useVibeQuiz — energy-specific vibe targeting', () => {
  it('CHILL energy boosts artists with Chill/Flow/Nostalgic vibes', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('CHILL') })
    act(() => { result.current.toggleGenre('JAZZ') })
    act(() => { result.current.setMoodTag('NOSTALGIC') })
    act(() => { result.current.computeResults() })
    const ids = result.current.results.map((a) => a.id)
    // jazz-1 has Chill+Flow vibes → should rank #1
    expect(ids[0]).toBe('jazz-1')
  })

  it('UNHINGED energy boosts artists with Hard/Rave/Dance vibes', () => {
    const { result } = renderHook(() => useVibeQuiz(FULL_LINEUP))
    act(() => { result.current.setEnergy('UNHINGED') })
    act(() => { result.current.toggleGenre('TECHNO') })
    act(() => { result.current.setMoodTag('HARD') })
    act(() => { result.current.computeResults() })
    const ids = result.current.results.map((a) => a.id)
    // techno-1 has Dance+Hard+Rave vibes → should rank #1
    expect(ids[0]).toBe('techno-1')
  })
})
