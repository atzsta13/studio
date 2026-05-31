import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTranslation } from '@/hooks/use-translation'
import type { FestivalConfig } from '@/config/festival-engine'

// ---------------------------------------------------------------------------
// Mock next/navigation (useTranslation itself doesn't use it, but transitive
// imports inside insider-provider may reference Next.js internals in jsdom)
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useParams: () => ({ festivalId: 'sziget-2026' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/sziget-2026',
}))

// ---------------------------------------------------------------------------
// Build a minimal FestivalConfig fixture that satisfies the interface
// ---------------------------------------------------------------------------
function makeConfig(overrides: Partial<FestivalConfig> = {}): FestivalConfig {
  return {
    id: 'test-festival',
    slug: 'test',
    name: 'Test Festival',
    fullName: 'Test Festival 2026',
    appName: 'Test Insider',
    tagline: 'Test tagline',
    description: 'Test description',
    officialWebsite: 'https://example.com',
    deepLinkScheme: 'test2026',
    aiPersona: 'test persona',
    location: {
      city: 'Test City',
      country: 'Testland',
      countryCode: 'TS',
      venue: 'Test Venue',
      timezone: 'UTC',
      lat: 0,
      lng: 0,
      weatherDisplayName: 'Test City',
    },
    dates: {
      year: 2026,
      startDate: '2026-08-01',
      endDate: '2026-08-07',
      days: ['2026-08-01'],
      dayLabels: { '2026-08-01': 'Day 1' },
      openingDayFilter: '2026-08-01',
    },
    currency: {
      localCode: 'EUR',
      localName: 'Euro',
      eurRate: 1,
      usdRate: 1.1,
      gbpRate: 0.85,
      showConverter: false,
    },
    theme: {
      primaryHex: '#000000',
      primaryHsl: '0 0% 0%',
      accentHex: '#ffffff',
      accentHsl: '0 0% 100%',
      secondaryHex: '#888888',
      secondaryHsl: '0 0% 53%',
      backgroundHex: '#111111',
      backgroundHsl: '0 0% 7%',
      cardHex: '#222222',
      cardHsl: '0 0% 13%',
      glowColor: '#000000',
      aesthetic: 'brutalist',
      androidPrimaryLong: '0xFF000000',
      androidAccentLong: '0xFFFFFFFF',
      androidSecondaryLong: '0xFF888888',
    },
    features: {
      currencyConverter: false,
      tentFinder: false,
      vibeQuiz: false,
      aiRecommendations: false,
      survivalGuide: false,
      timetable: false,
      cashlessLink: false,
      dayparkNightpark: false,
      familyZone: false,
      hydrationTracker: false,
      sunscreenAlert: false,
      batterySaver: false,
      friendFinder: false,
      groupSchedules: false,
      similarArtists: false,
      vibeOfTheHour: false,
      stageCapacity: false,
      foodRatings: false,
      budgetTracker: false,
      lostAndFound: false,
      sosMorseCode: false,
      festivalDictionary: false,
      firstAidFinder: false,
      chargingStations: false,
      shuttleTimetable: false,
      weatherRadar: false,
      setlistLinks: false,
      clashResolver: false,
      posterGenerator: false,
      customThemes: false,
      waterCounter: false,
      carFinder: false,
      notesJournal: false,
      newsBulletin: false,
      setCountdowns: false,
      surpriseRoulette: false,
      genreBreakdown: false,
      vibeAnalysis: false,
      accessibilityMap: false,
      quietZones: false,
      secretStages: false,
      afterMovie: false,
      feedbackSystem: false,
      offlineBanner: false,
      audioMonitor: false,
      highContrast: false,
    },
    content: {
      shuttleRoutes: [],
      dictionaryTerms: [],
    },
    ...overrides,
  } as FestivalConfig
}

// ---------------------------------------------------------------------------
// Mock @/components/layout/insider-provider so useInsider() returns our fixture
// ---------------------------------------------------------------------------
const mockConfig = makeConfig()

vi.mock('@/components/layout/insider-provider', () => ({
  useInsider: () => ({
    config: mockConfig,
    features: mockConfig.features,
    batterySaver: false,
    toggleBatterySaver: vi.fn(),
    getStorageKey: (key: string) => `test-festival-${key}`,
    isOnline: true,
  }),
}))

describe('useTranslation', () => {
  it('returns the key itself when no i18n config is present', () => {
    // mockConfig has no i18n field, so t(key) should return the key
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('nav_home')).toBe('nav_home')
    expect(result.current.t('some_missing_key')).toBe('some_missing_key')
  })

  it('exposes the default locale when no i18n config is present', () => {
    const { result } = renderHook(() => useTranslation())
    // defaultLocale falls back to 'en' when config.i18n is absent
    expect(result.current.locale).toBe('en')
  })

  it('exposes a single default locale list when no i18n config is present', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.locales).toEqual(['en'])
  })
})

// ---------------------------------------------------------------------------
// Second suite: config WITH i18n translations
// ---------------------------------------------------------------------------
describe('useTranslation — with i18n config', () => {
  const configWithI18n = makeConfig({
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'de'],
      translations: {
        en: {
          nav_home: 'Home',
          nav_artists: 'Artists',
        },
        de: {
          nav_home: 'Startseite',
          nav_artists: 'Künstler',
        },
      },
    },
  })

  // Override the mock for this suite
  beforeEach(() => {
    vi.doMock('@/components/layout/insider-provider', () => ({
      useInsider: () => ({
        config: configWithI18n,
        features: configWithI18n.features,
        batterySaver: false,
        toggleBatterySaver: vi.fn(),
        getStorageKey: (key: string) => `test-festival-${key}`,
        isOnline: true,
      }),
    }))
  })

  it('returns the key itself when i18n mock override cannot override the cached module', async () => {
    // vi.doMock does not flush the already-cached module, so the static
    // vi.mock (no i18n config) remains active. The hook's t() must return
    // the key verbatim when config.i18n is absent.
    const { useTranslation: useT } = await import('@/hooks/use-translation')
    const { result } = renderHook(() => useT())
    // With the static mock (no i18n), t() returns the key, NOT a translated value
    expect(result.current.t('nav_home')).toBe('nav_home')
  })

  it('t() returns the key when a key is missing from translations', async () => {
    const { useTranslation: useT } = await import('@/hooks/use-translation')
    const { result } = renderHook(() => useT())
    expect(result.current.t('completely_unknown_key')).toBe('completely_unknown_key')
  })
})
