import { describe, it, expect } from 'vitest'
import { getFestivalConfig, FESTIVAL_CONFIGS, FESTIVAL_IDS } from '@/config/festival-engine'
import type { FestivalConfig } from '@/config/festival-engine'

describe('getFestivalConfig', () => {
  it('returns a valid config object for "sziget-2026"', () => {
    const config = getFestivalConfig('sziget-2026')
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('has required field: id', () => {
    const config = getFestivalConfig('sziget-2026')
    expect(config.id).toBe('sziget-2026')
  })

  it('has required field: name', () => {
    const config = getFestivalConfig('sziget-2026')
    expect(typeof config.name).toBe('string')
    expect(config.name.length).toBeGreaterThan(0)
  })

  it('has required field: theme with primaryHex and accentHex', () => {
    const config = getFestivalConfig('sziget-2026')
    expect(config.theme).toBeDefined()
    expect(typeof config.theme.primaryHex).toBe('string')
    expect(typeof config.theme.accentHex).toBe('string')
  })

  it('has required field: features (boolean flags)', () => {
    const config = getFestivalConfig('sziget-2026')
    expect(config.features).toBeDefined()
    expect(typeof config.features.timetable).toBe('boolean')
    expect(typeof config.features.vibeQuiz).toBe('boolean')
    expect(typeof config.features.aiRecommendations).toBe('boolean')
  })

  it('has required field: dates with startDate and endDate', () => {
    const config = getFestivalConfig('sziget-2026')
    expect(config.dates).toBeDefined()
    expect(typeof config.dates.startDate).toBe('string')
    expect(typeof config.dates.endDate).toBe('string')
    expect(config.dates.year).toBe(2026)
  })

  it('falls back to sziget config gracefully for an unknown festival ID', () => {
    // getFestivalConfig returns sziget as safe default for unknown IDs
    const config = getFestivalConfig('unknown-festival-9999')
    expect(config).toBeDefined()
    expect(typeof config.id).toBe('string')
    // Should return the sziget default (the safe fallback)
    expect(config.id).toBe('sziget-2026')
  })

  it('returns undefined-safe config when called with undefined', () => {
    // undefined falls back to NEXT_PUBLIC_FESTIVAL_ID env var or 'sziget-2026'
    const config = getFestivalConfig(undefined)
    expect(config).toBeDefined()
    expect(typeof config.id).toBe('string')
  })

  it('FESTIVAL_IDS contains all known festival ids', () => {
    expect(FESTIVAL_IDS).toContain('sziget-2026')
    expect(FESTIVAL_IDS).toContain('novarock-2026')
    expect(FESTIVAL_IDS).toContain('area53-2026')
    expect(FESTIVAL_IDS).toContain('frequency-2026')
  })

  it('all configs in FESTIVAL_CONFIGS satisfy the FestivalConfig shape', () => {
    for (const id of FESTIVAL_IDS) {
      const config: FestivalConfig = FESTIVAL_CONFIGS[id]
      expect(config.id).toBe(id)
      expect(typeof config.name).toBe('string')
      expect(typeof config.theme.primaryHex).toBe('string')
      expect(config.features).toBeDefined()
      expect(config.dates).toBeDefined()
    }
  })
})
