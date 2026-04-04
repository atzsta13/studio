// src/config/festival.ts
import sziget from '../../festivals/sziget-2026/config.json'
import area53 from '../../festivals/area53-2026/config.json'
import novarock from '../../festivals/novarock-2026/config.json'
import frequency from '../../festivals/frequency-2026/config.json'

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
  deepLinkScheme: string
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
    glowColor: string
    aesthetic: 'brutalist' | 'metal' | 'rock' | 'mainstream'
    androidPrimaryLong: string
    androidAccentLong: string
    androidSecondaryLong: string
  }
  features: {
    // Phase 1 Core (Existing)
    currencyConverter: boolean
    tentFinder: boolean
    vibeQuiz: boolean
    passport: boolean
    spotifyIntegration: boolean
    aiRecommendations: boolean
    survivalGuide: boolean
    timetable: boolean
    cashlessLink: boolean
    cashlessUrl?: string
    dayparkNightpark: boolean
    familyZone: boolean

    // Phase 3 Hyper-Insider Expansion (50 Features)
    hydrationTracker: boolean
    sunscreenAlert: boolean
    batterySaver: boolean
    friendFinder: boolean
    groupSchedules: boolean
    artistTrivia: boolean
    similarArtists: boolean
    vibeOfTheHour: boolean
    stageCapacity: boolean
    merchCatalog: boolean
    foodRatings: boolean
    budgetTracker: boolean
    lostAndFound: boolean
    dailyChallenges: boolean
    leaderboard: boolean
    achievements: boolean
    sosMorseCode: boolean
    festivalDictionary: boolean
    firstAidFinder: boolean
    chargingStations: boolean
    shuttleTimetable: boolean
    weatherRadar: boolean
    setlistLinks: boolean
    collabPlaylists: boolean
    arStageView: boolean
    stickerBook: boolean
    fanPolls: boolean
    photoWall: boolean
    clashResolver: boolean
    posterGenerator: boolean
    customThemes: boolean
    waterCounter: boolean
    carFinder: boolean
    notesJournal: boolean
    socialFeed: boolean
    newsBulletin: boolean
    setCountdowns: boolean
    surpriseRoulette: boolean
    genreBreakdown: boolean
    vibeAnalysis: boolean
    accessibilityMap: boolean
    quietZones: boolean
    crowdHeatmap: boolean
    merchPriceWatch: boolean
    ecoWarrior: boolean
    secretStages: boolean
    afterMovie: boolean
    feedbackSystem: boolean
    offlineBanner: boolean
    audioMonitor: boolean
    highContrast: boolean
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
    passport?: {
      stamps: Array<{
        id: string
        title: string
        icon: string
        description: string
        category: 'stage' | 'utility' | 'food' | 'secret'
        color: string
        androidColor: string
      }>
      ranks: Array<{
        title: string
        minXP: number
      }>
    }
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
}

export function loadFestivalConfig(): FestivalConfig {
  const id = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
  const config = FESTIVAL_CONFIGS[id]
  if (!config) {
    const valid = Object.keys(FESTIVAL_CONFIGS).join(', ')
    throw new Error(`Unknown FESTIVAL_ID: \"${id}\". Valid options: ${valid}`)
  }
  return config
}

export const FESTIVAL = loadFestivalConfig()
