import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getRandomUnfavoritedArtist } from '@/lib/serendipity'
import type { LineupItem } from '@/types'

function makeArtist(id: string): LineupItem {
  return {
    id,
    artist: `Artist ${id}`,
    day: null,
    genres: [],
    vibes: [],
  }
}

const ARTISTS = ['a', 'b', 'c', 'd', 'e'].map(makeArtist)

describe('getRandomUnfavoritedArtist', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null for an empty lineup', () => {
    const result = getRandomUnfavoritedArtist([], new Set(), new Set())
    expect(result).toBeNull()
  })

  it('returns an artist when no restrictions apply', () => {
    const result = getRandomUnfavoritedArtist(ARTISTS, new Set(), new Set())
    expect(result).not.toBeNull()
    expect(ARTISTS.map((a) => a.id)).toContain(result!.id)
  })

  it('never returns a favorited artist when other artists exist', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const favorited = new Set(['a', 'b', 'c', 'd'])
    const result = getRandomUnfavoritedArtist(ARTISTS, favorited, new Set())
    // Only 'e' is available
    expect(result!.id).toBe('e')
  })

  it('never returns a recently spun artist when other artists exist', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const recentlySpun = new Set(['a', 'b', 'c', 'd'])
    const result = getRandomUnfavoritedArtist(ARTISTS, new Set(), recentlySpun)
    expect(result!.id).toBe('e')
  })

  it('falls back to unfavorited pool when all artists have been recently spun', () => {
    const recentlySpun = new Set(ARTISTS.map((a) => a.id))
    const favorited = new Set<string>()
    const result = getRandomUnfavoritedArtist(ARTISTS, favorited, recentlySpun)
    // All spun → falls back to unfavorited pool (= all artists since none favorited)
    expect(result).not.toBeNull()
  })

  it('falls back to full pool when all artists are favorited', () => {
    const favorited = new Set(ARTISTS.map((a) => a.id))
    const result = getRandomUnfavoritedArtist(ARTISTS, favorited, new Set())
    // All favorited → falls back to all artists
    expect(result).not.toBeNull()
  })

  it('adds the selected artist to recentlySpunIds', () => {
    const recentlySpun = new Set<string>()
    const result = getRandomUnfavoritedArtist(ARTISTS, new Set(), recentlySpun)
    expect(recentlySpun.has(result!.id)).toBe(true)
  })

  it('uses Math.random to pick from the pool', () => {
    // Math.random returns 0 → picks index 0 from the pool
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = getRandomUnfavoritedArtist(ARTISTS, new Set(), new Set())
    expect(result!.id).toBe('a')
  })

  it('respects both favorited and recently spun exclusions simultaneously', () => {
    const favorited = new Set(['a', 'b'])
    const recentlySpun = new Set(['c', 'd'])
    // Primary pool: not favorited AND not recently spun → only 'e'
    const result = getRandomUnfavoritedArtist(ARTISTS, favorited, recentlySpun)
    expect(result!.id).toBe('e')
  })

  it('works correctly with a single-artist lineup', () => {
    const single = [makeArtist('solo')]
    const result = getRandomUnfavoritedArtist(single, new Set(), new Set())
    expect(result!.id).toBe('solo')
  })

  it('returns an artist even when lineup has one fully favorited artist', () => {
    const single = [makeArtist('solo')]
    const result = getRandomUnfavoritedArtist(single, new Set(['solo']), new Set())
    // Falls back to full pool
    expect(result!.id).toBe('solo')
  })
})
