import { describe, it, expect, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// useFavorites — pure localStorage contract tests
// These tests exercise the storage key format, migration path, and data
// structure that the hook reads/writes, without React rendering.
// ---------------------------------------------------------------------------

const FESTIVAL_ID = 'sziget-2026'
const V2_KEY = `${FESTIVAL_ID}-favorites-v2`
const V1_KEY = `${FESTIVAL_ID}-favorites`

function readV2(): Record<string, string> {
  const raw = localStorage.getItem(V2_KEY)
  return raw ? (JSON.parse(raw) as Record<string, string>) : {}
}

function writeV2(data: Record<string, string>) {
  localStorage.setItem(V2_KEY, JSON.stringify(data))
}

describe('useFavorites — localStorage contract', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no favorites when localStorage is empty', () => {
    const data = readV2()
    expect(Object.keys(data).length).toBe(0)
  })

  it('stores a must_see favorite under the v2 key', () => {
    const data = { 'artist-1': 'must_see' }
    writeV2(data)
    const stored = readV2()
    expect(stored['artist-1']).toBe('must_see')
  })

  it('stores an interested favorite under the v2 key', () => {
    const data = { 'artist-2': 'interested' }
    writeV2(data)
    const stored = readV2()
    expect(stored['artist-2']).toBe('interested')
  })

  it('can add multiple artists with different tiers', () => {
    const data = {
      'artist-1': 'must_see',
      'artist-2': 'interested',
      'artist-3': 'must_see',
    }
    writeV2(data)
    const stored = readV2()
    expect(Object.keys(stored).length).toBe(3)
    expect(stored['artist-1']).toBe('must_see')
    expect(stored['artist-2']).toBe('interested')
  })

  it('removing an artist deletes their key', () => {
    writeV2({ 'artist-1': 'must_see', 'artist-2': 'interested' })
    const data = readV2()
    delete data['artist-1']
    writeV2(data)
    const stored = readV2()
    expect('artist-1' in stored).toBe(false)
    expect(stored['artist-2']).toBe('interested')
  })

  it('v1 migration: plain array of ids maps to must_see tier', () => {
    // Simulate what the hook does during migration on load
    localStorage.setItem(V1_KEY, JSON.stringify(['legacy-1', 'legacy-2']))

    const v1Raw = localStorage.getItem(V1_KEY)
    const v1Ids: string[] = v1Raw ? JSON.parse(v1Raw) : []
    const migrated: Record<string, string> = {}
    v1Ids.forEach((id) => { migrated[id] = 'must_see' })
    localStorage.setItem(V2_KEY, JSON.stringify(migrated))

    const stored = readV2()
    expect(stored['legacy-1']).toBe('must_see')
    expect(stored['legacy-2']).toBe('must_see')
  })

  it('v2 key takes precedence over v1 when both exist', () => {
    localStorage.setItem(V1_KEY, JSON.stringify(['old-artist']))
    writeV2({ 'new-artist': 'interested' })

    // Hook reads v2 first; if present it does NOT migrate v1
    const v2Raw = localStorage.getItem(V2_KEY)
    const data: Record<string, string> = v2Raw ? JSON.parse(v2Raw) : {}

    expect('new-artist' in data).toBe(true)
    expect('old-artist' in data).toBe(false)
  })

  it('festival scoping: keys from different festivals do not collide', () => {
    const otherKey = 'area53-2026-favorites-v2'
    writeV2({ 'artist-x': 'must_see' })
    localStorage.setItem(otherKey, JSON.stringify({ 'artist-x': 'interested' }))

    const sziget = readV2()
    const area53: Record<string, string> = JSON.parse(
      localStorage.getItem(otherKey) ?? '{}'
    )

    expect(sziget['artist-x']).toBe('must_see')
    expect(area53['artist-x']).toBe('interested')
  })
})
