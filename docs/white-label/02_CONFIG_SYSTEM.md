# Festival Config System

The config system is the single source of truth for all festival-specific values on both platforms. This document defines the full TypeScript interface, all four festival config objects, the Android Kotlin equivalent, and how to wire everything together.

---

## Web: `src/config/festival.ts`

Create this file. It replaces every hardcoded Sziget literal in the web codebase.

```typescript
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
      startDate: '2026-08-06',
      endDate: '2026-08-12',
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
```

---

## CSS Variable Injection

In `src/app/layout.tsx`, inject the festival theme as CSS custom properties so Tailwind utility classes (`text-primary`, `bg-accent`, etc.) automatically use the correct festival palette:

```tsx
// src/app/layout.tsx (excerpt)
import { FESTIVAL } from '@/config/festival'

const themeStyle = `
  :root {
    --primary: ${FESTIVAL.theme.primaryHsl};
    --primary-foreground: 0 0% 100%;
    --secondary: ${FESTIVAL.theme.secondaryHsl};
    --secondary-foreground: 0 0% 100%;
    --accent: ${FESTIVAL.theme.accentHsl};
    --accent-foreground: 0 0% 0%;
    --background: ${FESTIVAL.theme.backgroundHsl};
    --card: ${FESTIVAL.theme.cardHsl};
    --card-foreground: 0 0% 100%;
    --muted: 240 4% 16%;
    --muted-foreground: 0 0% 63%;
    --border: 240 4% 16%;
  }
  .text-glow {
    text-shadow: 0 0 20px ${FESTIVAL.theme.glowColor};
  }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Android: `FestivalConfig.kt`

The existing `FestivalConfig.kt` object is already a good pattern. The Phase 1 change is to make it read from `BuildConfig.FESTIVAL_ID` (set per product flavor) instead of being hard-wired to Sziget values.

```kotlin
// android/app/src/main/java/com/yourcompany/festivalinsider/data/config/FestivalConfig.kt

package com.yourcompany.festivalinsider.data.config

import com.yourcompany.festivalinsider.BuildConfig
import java.util.Calendar

data class FestivalFeatures(
    val currencyConverter: Boolean,
    val tentFinder: Boolean,
    val vibeQuiz: Boolean,
    val passport: Boolean,
    val spotifyIntegration: Boolean,
    val timetable: Boolean,
    val cashlessLink: Boolean,
    val cashlessUrl: String?,
    val dayparkNightpark: Boolean,
    val familyZone: Boolean,
)

data class FestivalConfigData(
    val id: String,
    val name: String,
    val tagline: String,
    val year: Int,
    val city: String,
    val countryCode: String,
    val venue: String,
    val timezone: String,
    val weatherDisplayName: String,
    val startYear: Int,
    val startMonth: Int,         // 1-indexed (java.time)
    val startDay: Int,
    val endMonth: Int,
    val endDay: Int,
    val calendarStartMonth: Int, // Calendar.JANUARY = 0 constant
    val dateDisplay: String,
    val dateVenueDisplay: String,
    val days: List<String>,
    val dayLabels: Map<String, String>,
    val openingDayFilter: String,
    val lat: Double,
    val lng: Double,
    val localCurrencyCode: String,
    val localCurrencyName: String,
    val eurRate: Double,
    val usdRate: Double,
    val showCurrencyConverter: Boolean,
    val aiPersona: String,
    val deepLinkScheme: String,
    val officialWebsite: String,
    val primaryColorHex: Long,   // e.g. 0xFFFF0080L (ARGB)
    val accentColorHex: Long,
    val secondaryColorHex: Long,
    val features: FestivalFeatures,
)

object FestivalConfig {

    val current: FestivalConfigData by lazy {
        when (BuildConfig.FESTIVAL_ID) {
            "sziget-2026"    -> sziget2026
            "area53-2026"    -> area532026
            "novarock-2026"  -> novarock2026
            "frequency-2026" -> frequency2026
            else -> throw IllegalStateException(
                "Unknown FESTIVAL_ID: '${BuildConfig.FESTIVAL_ID}'"
            )
        }
    }

    // Convenience accessors
    val NAME              get() = current.name
    val DAYS              get() = current.days
    val DAY_LABELS        get() = current.dayLabels
    val OPENING_DAY       get() = current.openingDayFilter
    val LAT               get() = current.lat
    val LNG               get() = current.lng
    val TIMEZONE          get() = current.timezone
    val CURRENCY_CODE     get() = current.localCurrencyCode
    val EUR_RATE          get() = current.eurRate
    val DEEP_LINK_SCHEME  get() = current.deepLinkScheme
    val FEATURES          get() = current.features

    // ── Sziget 2026 ────────────────────────────────────────────────────────
    private val sziget2026 = FestivalConfigData(
        id = "sziget-2026",
        name = "Sziget",
        tagline = "Island of Freedom",
        year = 2026,
        city = "Budapest",
        countryCode = "HU",
        venue = "Óbudai-sziget",
        timezone = "Europe/Budapest",
        weatherDisplayName = "Budapest · Óbudai-sziget",
        startYear = 2026, startMonth = 8, startDay = 6,
        endMonth = 8, endDay = 12,
        calendarStartMonth = Calendar.AUGUST,
        dateDisplay = "Aug 6 – 12, Budapest",
        dateVenueDisplay = "Aug 6 – 12 · Budapest · Óbudai-sziget",
        days = listOf("Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday"),
        dayLabels = mapOf(
            "Wednesday" to "WED", "Thursday" to "THU", "Friday" to "FRI",
            "Saturday" to "SAT", "Sunday" to "SUN", "Monday" to "MON", "Tuesday" to "TUE"
        ),
        openingDayFilter = "Wednesday",
        lat = 47.5194, lng = 19.0512,
        localCurrencyCode = "HUF", localCurrencyName = "Forint",
        eurRate = 400.0, usdRate = 370.0,
        showCurrencyConverter = true,
        aiPersona = "the Sziget Insider Scout, a legendary festival veteran who knows every corner of the Island of Freedom",
        deepLinkScheme = "sziget2026",
        officialWebsite = "https://szigetfestival.com",
        primaryColorHex = 0xFFFF0080L,
        accentColorHex  = 0xFFFFEE00L,
        secondaryColorHex = 0xFF00C3FFL,
        features = FestivalFeatures(
            currencyConverter = true, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = false, cashlessUrl = null,
            dayparkNightpark = false, familyZone = false,
        ),
    )

    // ── Area 53 2026 ────────────────────────────────────────────────────────
    private val area532026 = FestivalConfigData(
        id = "area53-2026",
        name = "Area 53",
        tagline = "Austria's Biggest Heavy Metal Festival",
        year = 2026,
        city = "Leoben",
        countryCode = "AT",
        venue = "VAZ Schladnitz",
        timezone = "Europe/Vienna",
        weatherDisplayName = "Leoben · VAZ Schladnitz",
        startYear = 2026, startMonth = 7, startDay = 16,
        endMonth = 7, endDay = 18,
        calendarStartMonth = Calendar.JULY,
        dateDisplay = "Jul 16 – 18, Leoben",
        dateVenueDisplay = "Jul 16 – 18 · Leoben · VAZ Schladnitz",
        days = listOf("Thursday","Friday","Saturday"),
        dayLabels = mapOf("Thursday" to "THU", "Friday" to "FRI", "Saturday" to "SAT"),
        openingDayFilter = "Thursday",
        lat = 47.3769, lng = 15.0944,
        localCurrencyCode = "EUR", localCurrencyName = "Euro",
        eurRate = 1.0, usdRate = 0.92,
        showCurrencyConverter = false,
        aiPersona = "the Area 53 Metal Scout, a battle-hardened metalhead who has attended every edition since 2017",
        deepLinkScheme = "area532026",
        officialWebsite = "https://area53festival.at/en/",
        primaryColorHex = 0xFFCC0000L,
        accentColorHex  = 0xFFFFFFFFL,
        secondaryColorHex = 0xFF888888L,
        features = FestivalFeatures(
            currencyConverter = false, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = false, cashlessUrl = null,
            dayparkNightpark = false, familyZone = false,
        ),
    )

    // ── Nova Rock 2026 ──────────────────────────────────────────────────────
    private val novarock2026 = FestivalConfigData(
        id = "novarock-2026",
        name = "Nova Rock",
        tagline = "Rock the Fields",
        year = 2026,
        city = "Nickelsdorf",
        countryCode = "AT",
        venue = "Pannonia Fields II",
        timezone = "Europe/Vienna",
        weatherDisplayName = "Nickelsdorf · Pannonia Fields II",
        startYear = 2026, startMonth = 6, startDay = 11,
        endMonth = 6, endDay = 14,
        calendarStartMonth = Calendar.JUNE,
        dateDisplay = "Jun 11 – 14, Nickelsdorf",
        dateVenueDisplay = "Jun 11 – 14 · Nickelsdorf · Pannonia Fields II",
        days = listOf("Thursday","Friday","Saturday","Sunday"),
        dayLabels = mapOf(
            "Thursday" to "THU","Friday" to "FRI","Saturday" to "SAT","Sunday" to "SUN"
        ),
        openingDayFilter = "Thursday",
        lat = 47.9381, lng = 17.0651,
        localCurrencyCode = "EUR", localCurrencyName = "Euro",
        eurRate = 1.0, usdRate = 0.92,
        showCurrencyConverter = false,
        aiPersona = "the Nova Rock Scout, a rock veteran who has survived every Pannonia dust storm since 2005",
        deepLinkScheme = "novarock2026",
        officialWebsite = "https://www.novarock.at/en/",
        primaryColorHex = 0xFFFF6600L,
        accentColorHex  = 0xFFFFD700L,
        secondaryColorHex = 0xFFFF4444L,
        features = FestivalFeatures(
            currencyConverter = false, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = true, cashlessUrl = "https://www.novarock.at/en/cashless/",
            dayparkNightpark = false, familyZone = true,
        ),
    )

    // ── FM4 Frequency 2026 ──────────────────────────────────────────────────
    private val frequency2026 = FestivalConfigData(
        id = "frequency-2026",
        name = "Frequency",
        tagline = "Green Park Comes Alive",
        year = 2026,
        city = "St. Pölten",
        countryCode = "AT",
        venue = "Green Park Traisen",
        timezone = "Europe/Vienna",
        weatherDisplayName = "St. Pölten · Green Park",
        startYear = 2026, startMonth = 8, startDay = 20,
        endMonth = 8, endDay = 22,
        calendarStartMonth = Calendar.AUGUST,
        dateDisplay = "Aug 20 – 22, St. Pölten",
        dateVenueDisplay = "Aug 20 – 22 · St. Pölten · Green Park",
        days = listOf("Thursday","Friday","Saturday"),
        dayLabels = mapOf("Thursday" to "THU","Friday" to "FRI","Saturday" to "SAT"),
        openingDayFilter = "Thursday",
        lat = 48.2088, lng = 15.6360,
        localCurrencyCode = "EUR", localCurrencyName = "Euro",
        eurRate = 1.0, usdRate = 0.92,
        showCurrencyConverter = false,
        aiPersona = "the Frequency Scout, a St. Pölten regular who knows every act on the Daypark stages and Nightpark floors",
        deepLinkScheme = "frequency2026",
        officialWebsite = "https://www.frequency.at/en/",
        primaryColorHex = 0xFF8B00FFL,
        accentColorHex  = 0xFF00FF88L,
        secondaryColorHex = 0xFFFF00AAL,
        features = FestivalFeatures(
            currencyConverter = false, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = true, cashlessUrl = "https://www.frequency.at/en/cashless/",
            dayparkNightpark = true, familyZone = false,
        ),
    )
}
```

---

## Android: `build.gradle.kts` Product Flavors

```kotlin
// android/app/build.gradle.kts (flavor section only — add inside android {})

flavorDimensions += "festival"

productFlavors {
    create("sziget") {
        dimension = "festival"
        applicationId = "com.yourcompany.szigetinsider"
        versionName = "2.0-sziget"
        resValue("string", "app_name", "Sziget Insider 2026")
        buildConfigField("String", "FESTIVAL_ID", "\"sziget-2026\"")
        manifestPlaceholders["deepLinkScheme"] = "sziget2026"
    }
    create("area53") {
        dimension = "festival"
        applicationId = "com.yourcompany.area53insider"
        versionName = "1.0-area53"
        resValue("string", "app_name", "Area 53 Insider 2026")
        buildConfigField("String", "FESTIVAL_ID", "\"area53-2026\"")
        manifestPlaceholders["deepLinkScheme"] = "area532026"
    }
    create("novarock") {
        dimension = "festival"
        applicationId = "com.yourcompany.novarockinsider"
        versionName = "1.0-novarock"
        resValue("string", "app_name", "Nova Rock Insider 2026")
        buildConfigField("String", "FESTIVAL_ID", "\"novarock-2026\"")
        manifestPlaceholders["deepLinkScheme"] = "novarock2026"
    }
    create("frequency") {
        dimension = "festival"
        applicationId = "com.yourcompany.frequencyinsider"
        versionName = "1.0-frequency"
        resValue("string", "app_name", "Frequency Insider 2026")
        buildConfigField("String", "FESTIVAL_ID", "\"frequency-2026\"")
        manifestPlaceholders["deepLinkScheme"] = "frequency2026"
    }
}

// Per-flavor asset directories
sourceSets {
    getByName("sziget")    { assets.srcDirs("src/sziget/assets") }
    getByName("area53")    { assets.srcDirs("src/area53/assets") }
    getByName("novarock")  { assets.srcDirs("src/novarock/assets") }
    getByName("frequency") { assets.srcDirs("src/frequency/assets") }
}
```

---

## Environment Variables Reference

| Variable | Purpose | Default | Sziget | Area 53 | Nova Rock | Frequency |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_FESTIVAL_ID` | Selects festival config | `sziget-2026` | `sziget-2026` | `area53-2026` | `novarock-2026` | `frequency-2026` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project | — | sziget-project | area53-project | novarock-project | frequency-project |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase auth | — | per project | per project | per project | per project |
| `SPOTIFY_CLIENT_ID` | Spotify app ID | — | per app | per app | per app | per app |
| `SPOTIFY_CLIENT_SECRET` | Spotify app secret | — | per app | per app | per app | per app |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URL | — | `https://sziget.insiderapp.com/api/auth/spotify/callback` | per domain | per domain | per domain |
| `GOOGLE_GENAI_API_KEY` | Gemini AI key | — | shared or per-festival | shared or per-festival | shared or per-festival | shared or per-festival |
