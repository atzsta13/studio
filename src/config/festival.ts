// src/config/festival.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all festival-specific configuration.
// To add a new festival: add an entry to FESTIVAL_CONFIGS below and set
// NEXT_PUBLIC_FESTIVAL_ID in the Vercel project environment variables.
// ─────────────────────────────────────────────────────────────────────────────

export interface FestivalTheme {
  /** Hex value, e.g. "#FF0080". Used for meta theme-color + PWA manifest. */
  primaryHex: string
  /** HSL string for CSS custom property, e.g. "326 100% 50%". */
  primaryHsl: string
  accentHex: string
  accentHsl: string
  secondaryHex: string
  secondaryHsl: string
  backgroundHex: string
  backgroundHsl: string
  cardHex: string
  cardHsl: string
  /** rgba() string for .text-glow shadow, e.g. "rgba(255,0,128,0.4)". */
  glowColor: string
  /** Aesthetic token used by UI components to conditionally apply style variants. */
  aesthetic: 'brutalist' | 'metal' | 'rock' | 'mainstream'
}

export interface FestivalLocation {
  city: string
  country: string
  /** ISO 3166-1 alpha-2, e.g. "HU", "AT". */
  countryCode: string
  venue: string
  /** IANA timezone string, e.g. "Europe/Budapest". */
  timezone: string
  lat: number
  lng: number
  /** Displayed in the weather widget, e.g. "Budapest · Óbudai-sziget". */
  weatherDisplayName: string
}

export interface FestivalDates {
  year: number
  /** ISO 8601 date, e.g. "2026-08-06". */
  startDate: string
  endDate: string
  /** Ordered list of day names matching values in lineup.json. */
  days: string[]
  /** Short labels for UI chips, e.g. { "Wednesday": "WED" }. */
  dayLabels: Record<string, string>
  /**
   * The day shown on the home screen before the festival starts.
   * Usually the opening day (first in the days array).
   */
  openingDayFilter: string
}

export interface FestivalCurrency {
  /** ISO 4217 code, e.g. "HUF" or "EUR". */
  localCode: string
  localName: string
  /** 1 EUR expressed in local currency. Use 1 for EUR-native festivals. */
  eurRate: number
  usdRate: number
  gbpRate: number
  /**
   * Set false for EUR-native festivals (Austria) — hides the converter tool
   * since attendees don't need currency exchange.
   */
  showConverter: boolean
}

export interface FestivalFeatureFlags {
  currencyConverter: boolean
  /** GPS-based tent locator in Tools screen. */
  tentFinder: boolean
  vibeQuiz: boolean
  /** Passport stamp collection + XP/rank system. */
  passport: boolean
  spotifyIntegration: boolean
  aiRecommendations: boolean
  survivalGuide: boolean
  /** Set false until schedule data (stage/startTime/endTime) is published. */
  timetable: boolean
  /** Show a "Top Up Cashless Wallet →" external link (Nova Rock, Frequency). */
  cashlessLink: boolean
  cashlessUrl?: string
  /** Frequency-specific: timetable mode toggle between Daypark and Nightpark. */
  dayparkNightparkMode: boolean
  familyZone: boolean
}

export interface FestivalConfig {
  /** Unique stable identifier, e.g. "sziget-2026". Used as FESTIVAL_ID env var. */
  id: string
  /** URL-safe slug, e.g. "sziget". Used in routes and cache keys. */
  slug: string
  /** Short name, e.g. "Sziget". Used in UI headings. */
  name: string
  /** Full name with year, e.g. "Sziget Festival 2026". */
  fullName: string
  /** Festival tagline, e.g. "Island of Freedom". */
  tagline: string
  /** One-line app description for PWA manifest and meta tags. */
  description: string
  /**
   * AI persona string injected into the recommendation flow system prompt.
   * Should describe the character voice and festival knowledge.
   */
  aiPersona: string
  /** App name shown in header and PWA install prompt, e.g. "Sziget Insider 2026". */
  appName: string
  /**
   * URI scheme for Spotify OAuth deep link callback.
   * Must be unique per festival if multiple apps are installed simultaneously.
   * e.g. "sziget2026" → "sziget2026://spotify-callback"
   */
  deepLinkScheme: string
  location: FestivalLocation
  dates: FestivalDates
  currency: FestivalCurrency
  theme: FestivalTheme
  features: FestivalFeatureFlags
  officialWebsite: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Festival Config Objects
// ─────────────────────────────────────────────────────────────────────────────

export const FESTIVAL_CONFIGS: Record<string, FestivalConfig> = {

  // ── Sziget 2026 ─────────────────────────────────────────────────────────────
  'sziget-2026': {
    id: 'sziget-2026',
    slug: 'sziget',
    name: 'Sziget',
    fullName: 'Sziget Festival 2026',
    tagline: 'Island of Freedom',
    description: 'Your unofficial offline-first guide to Sziget Festival 2026.',
    aiPersona:
      "the 'Sziget Insider Scout', a legendary festival veteran who knows every corner of the Island of Freedom",
    appName: 'Sziget Insider 2026',
    deepLinkScheme: 'sziget2026',
    location: {
      city: 'Budapest',
      country: 'Hungary',
      countryCode: 'HU',
      venue: 'Óbudai-sziget',
      timezone: 'Europe/Budapest',
      lat: 47.5194,
      lng: 19.0512,
      weatherDisplayName: 'Budapest · Óbudai-sziget',
    },
    dates: {
      year: 2026,
      startDate: '2026-08-05',
      endDate: '2026-08-11',
      days: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'],
      dayLabels: {
        Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI',
        Saturday: 'SAT', Sunday: 'SUN', Monday: 'MON', Tuesday: 'TUE',
      },
      openingDayFilter: 'Wednesday',
    },
    currency: {
      localCode: 'HUF',
      localName: 'Forint',
      eurRate: 400,
      usdRate: 370,
      gbpRate: 470,
      showConverter: true,
    },
    theme: {
      primaryHex: '#FF0080',
      primaryHsl: '326 100% 50%',
      accentHex: '#FFEE00',
      accentHsl: '55 100% 50%',
      secondaryHex: '#00C3FF',
      secondaryHsl: '194 100% 50%',
      backgroundHex: '#09090B',
      backgroundHsl: '240 4% 4%',
      cardHex: '#131315',
      cardHsl: '240 4% 8%',
      glowColor: 'rgba(255, 0, 128, 0.4)',
      aesthetic: 'brutalist',
    },
    features: {
      currencyConverter: true,
      tentFinder: true,
      vibeQuiz: true,
      passport: true,
      spotifyIntegration: true,
      aiRecommendations: true,
      survivalGuide: true,
      timetable: false,
      cashlessLink: false,
      dayparkNightparkMode: false,
      familyZone: false,
    },
    officialWebsite: 'https://szigetfestival.com',
  },

  // ── Area 53 2026 ─────────────────────────────────────────────────────────────
  'area53-2026': {
    id: 'area53-2026',
    slug: 'area53',
    name: 'Area 53',
    fullName: 'Area 53 Festival 2026',
    tagline: "Austria's Biggest Heavy Metal Festival",
    description: 'Your unofficial guide to Area 53 Metal Festival 2026 in Leoben, Austria.',
    aiPersona:
      "the 'Area 53 Metal Scout', a battle-hardened metalhead who has attended every edition since 2017 and knows every riff and corner of the Tenne Leoben",
    appName: 'Area 53 Insider 2026',
    deepLinkScheme: 'area532026',
    location: {
      city: 'Leoben',
      country: 'Austria',
      countryCode: 'AT',
      venue: 'VAZ Schladnitz',
      timezone: 'Europe/Vienna',
      lat: 47.3769,
      lng: 15.0944,
      weatherDisplayName: 'Leoben · VAZ Schladnitz',
    },
    dates: {
      year: 2026,
      startDate: '2026-07-16',
      endDate: '2026-07-18',
      days: ['Thursday', 'Friday', 'Saturday'],
      dayLabels: { Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT' },
      openingDayFilter: 'Thursday',
    },
    currency: {
      localCode: 'EUR',
      localName: 'Euro',
      eurRate: 1,
      usdRate: 0.92,
      gbpRate: 1.17,
      showConverter: false,
    },
    theme: {
      primaryHex: '#CC0000',
      primaryHsl: '0 100% 40%',
      accentHex: '#FFFFFF',
      accentHsl: '0 0% 100%',
      secondaryHex: '#888888',
      secondaryHsl: '0 0% 53%',
      backgroundHex: '#09090B',
      backgroundHsl: '240 4% 4%',
      cardHex: '#131315',
      cardHsl: '240 4% 8%',
      glowColor: 'rgba(204, 0, 0, 0.5)',
      aesthetic: 'metal',
    },
    features: {
      currencyConverter: false,
      tentFinder: true,
      vibeQuiz: true,
      passport: true,
      spotifyIntegration: true,
      aiRecommendations: true,
      survivalGuide: true,
      timetable: false,
      cashlessLink: false,
      dayparkNightparkMode: false,
      familyZone: false,
    },
    officialWebsite: 'https://area53festival.at/en/',
  },

  // ── Nova Rock 2026 ───────────────────────────────────────────────────────────
  'novarock-2026': {
    id: 'novarock-2026',
    slug: 'novarock',
    name: 'Nova Rock',
    fullName: 'Nova Rock Festival 2026',
    tagline: 'Rock the Fields',
    description: 'Your unofficial discovery guide to Nova Rock Festival 2026 in Nickelsdorf.',
    aiPersona:
      "the 'Nova Rock Scout', a rock veteran who has survived every Pannonia dust storm since 2005 and knows all five stages by heart",
    appName: 'Nova Rock Insider 2026',
    deepLinkScheme: 'novarock2026',
    location: {
      city: 'Nickelsdorf',
      country: 'Austria',
      countryCode: 'AT',
      venue: 'Pannonia Fields II',
      timezone: 'Europe/Vienna',
      lat: 47.9381,
      lng: 17.0651,
      weatherDisplayName: 'Nickelsdorf · Pannonia Fields II',
    },
    dates: {
      year: 2026,
      startDate: '2026-06-11',
      endDate: '2026-06-14',
      days: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      dayLabels: { Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT', Sunday: 'SUN' },
      openingDayFilter: 'Thursday',
    },
    currency: {
      localCode: 'EUR',
      localName: 'Euro',
      eurRate: 1,
      usdRate: 0.92,
      gbpRate: 1.17,
      showConverter: false,
    },
    theme: {
      primaryHex: '#FF6600',
      primaryHsl: '24 100% 50%',
      accentHex: '#FFD700',
      accentHsl: '51 100% 50%',
      secondaryHex: '#FF4444',
      secondaryHsl: '0 100% 63%',
      backgroundHex: '#09090B',
      backgroundHsl: '240 4% 4%',
      cardHex: '#131315',
      cardHsl: '240 4% 8%',
      glowColor: 'rgba(255, 102, 0, 0.4)',
      aesthetic: 'rock',
    },
    features: {
      currencyConverter: false,
      tentFinder: true,
      vibeQuiz: true,
      passport: true,
      spotifyIntegration: true,
      aiRecommendations: true,
      survivalGuide: true,
      timetable: false,
      cashlessLink: true,
      cashlessUrl: 'https://www.novarock.at/en/cashless/',
      dayparkNightparkMode: false,
      familyZone: true,
    },
    officialWebsite: 'https://www.novarock.at/en/',
  },

  // ── FM4 Frequency 2026 ───────────────────────────────────────────────────────
  'frequency-2026': {
    id: 'frequency-2026',
    slug: 'frequency',
    name: 'Frequency',
    fullName: 'FM4 Frequency Festival 2026',
    tagline: 'Green Park Comes Alive',
    description: 'Your unofficial discovery guide to FM4 Frequency Festival 2026 in St. Pölten.',
    aiPersona:
      "the 'Frequency Scout', a St. Pölten regular who knows every act on both the Daypark stages and the Nightpark floors",
    appName: 'Frequency Insider 2026',
    deepLinkScheme: 'frequency2026',
    location: {
      city: 'St. Pölten',
      country: 'Austria',
      countryCode: 'AT',
      venue: 'Green Park Traisen',
      timezone: 'Europe/Vienna',
      lat: 48.2088,
      lng: 15.6360,
      weatherDisplayName: 'St. Pölten · Green Park',
    },
    dates: {
      year: 2026,
      startDate: '2026-08-20',
      endDate: '2026-08-22',
      days: ['Thursday', 'Friday', 'Saturday'],
      dayLabels: { Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT' },
      openingDayFilter: 'Thursday',
    },
    currency: {
      localCode: 'EUR',
      localName: 'Euro',
      eurRate: 1,
      usdRate: 0.92,
      gbpRate: 1.17,
      showConverter: false,
    },
    theme: {
      primaryHex: '#8B00FF',
      primaryHsl: '272 100% 50%',
      accentHex: '#00FF88',
      accentHsl: '152 100% 50%',
      secondaryHex: '#FF00AA',
      secondaryHsl: '319 100% 50%',
      backgroundHex: '#09090B',
      backgroundHsl: '240 4% 4%',
      cardHex: '#131315',
      cardHsl: '240 4% 8%',
      glowColor: 'rgba(139, 0, 255, 0.4)',
      aesthetic: 'mainstream',
    },
    features: {
      currencyConverter: false,
      tentFinder: true,
      vibeQuiz: true,
      passport: true,
      spotifyIntegration: true,
      aiRecommendations: true,
      survivalGuide: true,
      timetable: false,
      cashlessLink: true,
      cashlessUrl: 'https://www.frequency.at/en/cashless/',
      dayparkNightparkMode: true,
      familyZone: false,
    },
    officialWebsite: 'https://www.frequency.at/en/',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Loader
// ─────────────────────────────────────────────────────────────────────────────

export function loadFestivalConfig(): FestivalConfig {
  const id = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
  const config = FESTIVAL_CONFIGS[id]
  if (!config) {
    const valid = Object.keys(FESTIVAL_CONFIGS).join(', ')
    throw new Error(`Unknown FESTIVAL_ID: "${id}". Valid options: ${valid}`)
  }
  return config
}

/**
 * The active festival config for the current deployment.
 * Import this in any file that needs festival-specific values.
 *
 * @example
 * import { FESTIVAL } from '@/config/festival'
 * const { name, dates, location } = FESTIVAL
 */
export const FESTIVAL = loadFestivalConfig()
