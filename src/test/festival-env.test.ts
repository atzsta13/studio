// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import path from 'path'

// Dynamic import to avoid caching across tests that manipulate process.env
async function loadModule() {
  const mod = await import('../../scripts/utils/festival-env.mjs')
  return mod as {
    getFestivalId: () => string
    getAndroidSlug: (id: string) => string
    getFestivalPaths: (id?: string) => Record<string, string>
  }
}

describe('getAndroidSlug', () => {
  it('converts "sziget-2026" → "sziget"', async () => {
    const { getAndroidSlug } = await loadModule()
    expect(getAndroidSlug('sziget-2026')).toBe('sziget')
  })

  it('converts "ernte-punk-2026" → "erntepunk" (strips hyphen between words)', async () => {
    const { getAndroidSlug } = await loadModule()
    expect(getAndroidSlug('ernte-punk-2026')).toBe('erntepunk')
  })

  it('converts "area53-2026" → "area53"', async () => {
    const { getAndroidSlug } = await loadModule()
    expect(getAndroidSlug('area53-2026')).toBe('area53')
  })

  it('converts "novarock-2026" → "novarock"', async () => {
    const { getAndroidSlug } = await loadModule()
    expect(getAndroidSlug('novarock-2026')).toBe('novarock')
  })

  it('converts "frequency-2026" → "frequency"', async () => {
    const { getAndroidSlug } = await loadModule()
    expect(getAndroidSlug('frequency-2026')).toBe('frequency')
  })

  it('strips only the trailing 4-digit year, leaving internal words intact', async () => {
    const { getAndroidSlug } = await loadModule()
    // "two-words-2099" → "twowords" (year stripped, hyphens between words removed)
    expect(getAndroidSlug('two-words-2099')).toBe('twowords')
  })
})

describe('getFestivalId', () => {
  const ORIG = process.env.NEXT_PUBLIC_FESTIVAL_ID

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_FESTIVAL_ID
  })

  afterEach(() => {
    if (ORIG !== undefined) {
      process.env.NEXT_PUBLIC_FESTIVAL_ID = ORIG
    } else {
      delete process.env.NEXT_PUBLIC_FESTIVAL_ID
    }
  })

  it('returns "sziget-2026" as default when env var is unset', async () => {
    const { getFestivalId } = await loadModule()
    expect(getFestivalId()).toBe('sziget-2026')
  })

  it('returns the value of NEXT_PUBLIC_FESTIVAL_ID when it is set', async () => {
    process.env.NEXT_PUBLIC_FESTIVAL_ID = 'area53-2026'
    const { getFestivalId } = await loadModule()
    expect(getFestivalId()).toBe('area53-2026')
  })
})

describe('getFestivalPaths', () => {
  it('returns an object with the expected keys', async () => {
    const { getFestivalPaths } = await loadModule()
    const paths = getFestivalPaths('sziget-2026')
    expect(paths).toHaveProperty('festivalId')
    expect(paths).toHaveProperty('slug')
    expect(paths).toHaveProperty('srcDataDir')
    expect(paths).toHaveProperty('srcConfig')
    expect(paths).toHaveProperty('androidAssetsDir')
    expect(paths).toHaveProperty('lineupFile')
    expect(paths).toHaveProperty('poiFile')
    expect(paths).toHaveProperty('foodFile')
    expect(paths).toHaveProperty('guideFile')
    expect(paths).toHaveProperty('survivalFile')
  })

  it('festivalId is echoed back in the result', async () => {
    const { getFestivalPaths } = await loadModule()
    expect(getFestivalPaths('novarock-2026').festivalId).toBe('novarock-2026')
  })

  it('slug is correctly derived from the festivalId', async () => {
    const { getFestivalPaths } = await loadModule()
    expect(getFestivalPaths('ernte-punk-2026').slug).toBe('erntepunk')
    expect(getFestivalPaths('sziget-2026').slug).toBe('sziget')
  })

  it('lineupFile path ends with "lineup.json"', async () => {
    const { getFestivalPaths } = await loadModule()
    expect(getFestivalPaths('sziget-2026').lineupFile).toMatch(/lineup\.json$/)
  })

  it('srcDataDir contains the festival id segment', async () => {
    const { getFestivalPaths } = await loadModule()
    expect(getFestivalPaths('novarock-2026').srcDataDir).toContain('novarock-2026')
  })

  it('androidAssetsDir contains the android slug, not the festival id', async () => {
    const { getFestivalPaths } = await loadModule()
    const paths = getFestivalPaths('ernte-punk-2026')
    expect(paths.androidAssetsDir).toContain('erntepunk')
    expect(paths.androidAssetsDir).not.toContain('ernte-punk')
  })

  it('all file paths are absolute', async () => {
    const { getFestivalPaths } = await loadModule()
    const paths = getFestivalPaths('sziget-2026')
    const files = ['srcDataDir', 'srcConfig', 'lineupFile', 'poiFile', 'foodFile', 'guideFile', 'survivalFile']
    files.forEach((key) => {
      expect(path.isAbsolute(paths[key])).toBe(true)
    })
  })

  it('uses the default festival id when called with no argument', async () => {
    const { getFestivalPaths } = await loadModule()
    const paths = getFestivalPaths()
    // Default is 'sziget-2026'
    expect(paths.festivalId).toBe('sziget-2026')
  })
})
