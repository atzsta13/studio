// src/config/festival.ts
import sziget from '../../festivals/sziget-2026/config.json'
import area53 from '../../festivals/area53-2026/config.json'
import novarock from '../../festivals/novarock-2026/config.json'
import frequency from '../../festivals/frequency-2026/config.json'
import erntepunk from '../../festivals/ernte-punk-2026/config.json'

// Ensure TypeScript knows the structure of our unified config
export interface FestivalConfig {
  id: string
  slug: string
  name: string
  fullName: string
  appName: string
  tagline: string
  description: string
  officialWebsite: string
  productionUrl?: string
  deepLinkScheme: string
  i18n?: {
    defaultLocale: string
    locales: string[]
    translations: Record<string, Record<string, string>>
  }
  aiPersona: string
  location: {
    city: string
    country: string
    countryCode: string
    venue: string
    timezone: string
    lat: number
    lng: number
    weatherDisplayName: string
  }
  dates: {
    year: number
    startDate: string
    endDate: string
    days: string[]
    dayLabels: Record<string, string>
    openingDayFilter: string
  }
  currency: {
    localCode: string
    localName: string
    eurRate: number
    usdRate: number
    gbpRate: number
    showConverter: boolean
  }
  theme: {
    primaryHex: string
    primaryHsl: string
    accentHex: string
    accentHsl: string
    secondaryHex: string
    secondaryHsl: string
    backgroundHex: string
    backgroundHsl: string
    cardHex: string
    cardHsl: string
    glowColor: string,
    aesthetic: 'brutalist' | 'metal' | 'rock' | 'mainstream' | 'punk'
    androidPrimaryLong: string
    androidAccentLong: string
    androidSecondaryLong: string
  }
  features: {
    // Navigation & discovery
    currencyConverter: boolean
    tentFinder: boolean
    vibeQuiz: boolean
    aiRecommendations: boolean
    survivalGuide: boolean
    timetable: boolean
    cashlessLink: boolean
    cashlessUrl?: string
    dayparkNightpark: boolean
    familyZone: boolean

    // Health & survival
    hydrationTracker: boolean
    sunscreenAlert: boolean
    batterySaver: boolean
    waterCounter: boolean
    audioMonitor: boolean
    sosMorseCode: boolean
    highContrast: boolean
    offlineBanner: boolean

    // Planning & schedule
    clashResolver: boolean
    setCountdowns: boolean
    groupSchedules: boolean
    friendFinder: boolean

    // Lineup & discovery
    similarArtists: boolean
    vibeOfTheHour: boolean
    genreBreakdown: boolean
    vibeAnalysis: boolean
    surpriseRoulette: boolean
    setlistLinks: boolean
    secretStages: boolean
    afterMovie: boolean

    // Map & location
    accessibilityMap: boolean
    quietZones: boolean
    chargingStations: boolean
    firstAidFinder: boolean
    carFinder: boolean

    // Practical tools
    foodRatings: boolean
    budgetTracker: boolean
    lostAndFound: boolean
    festivalDictionary: boolean
    shuttleTimetable: boolean
    weatherRadar: boolean
    notesJournal: boolean
    posterGenerator: boolean
    customThemes: boolean
    feedbackSystem: boolean
    stageCapacity: boolean

    // Pending implementation
    newsBulletin: boolean
  }
  content: {
    emergencyContacts?: {
      security: { phone: string; label: string }
      medical: { phone: string; label: string }
    }
    radarFocuses?: Array<{
      id: string
      label: string
      targetStages: string[]
      targetGenres: string[]
    }>
    hiddenGems?: string[]
    shuttleRoutes: Array<{
      id: string
      route: string
      from: string
      to: string
      freq: string
      active: string
    }>
    dictionaryTerms: Array<{
      term: string
      def: string
    }>
  }
}

export const FESTIVAL_CONFIGS: Record<string, FestivalConfig> = {
  'sziget-2026': sziget as FestivalConfig,
  'area53-2026': area53 as FestivalConfig,
  'novarock-2026': novarock as FestivalConfig,
  'frequency-2026': frequency as FestivalConfig,
  'ernte-punk-2026': erntepunk as FestivalConfig,
}

export const FESTIVAL_IDS = Object.keys(FESTIVAL_CONFIGS)

export function getFestivalConfig(id: string | undefined): FestivalConfig {
  const finalId = id ?? process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
  const config = FESTIVAL_CONFIGS[finalId]
  if (!config) {
    // If we're in the hub, we might not have a specific festival
    // return sziget as a safe default for types, but this shouldn't happen in [festivalId] routes
    return sziget as FestivalConfig
  }
  return config
}

export function loadFestivalConfig(): FestivalConfig {
  const id = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
  return getFestivalConfig(id)
}

export const FESTIVAL = loadFestivalConfig()
