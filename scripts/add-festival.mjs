#!/usr/bin/env node
/**
 * Scaffold a new festival into the platform.
 *
 * Usage:
 *   node scripts/add-festival.mjs <festival-id>
 *
 * Example:
 *   node scripts/add-festival.mjs lollapalooza-2026
 *
 * What it does:
 *   1. Creates festivals/<id>/data/ with empty JSON stubs
 *   2. Creates festivals/<id>/config.json from a template
 *   3. Registers the festival in src/config/festival-engine.ts
 *   4. Adds android:sync and lineup:update scripts to package.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const id = process.argv[2]
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: node scripts/add-festival.mjs <festival-id>')
  console.error('  Example: node scripts/add-festival.mjs lollapalooza-2026')
  console.error('  ID must be lowercase kebab-case, e.g. "my-festival-2026"')
  process.exit(1)
}

const slug = id.replace(/-\d{4}$/, '')           // "lollapalooza-2026" → "lollapalooza"
const year = id.match(/-(\d{4})$/)?.[1] ?? '2026'
const name = slug.charAt(0).toUpperCase() + slug.slice(1)

const festivalDir = path.join(ROOT, 'festivals', id)
const dataDir = path.join(festivalDir, 'data')

// ── 1. Create directory structure ──────────────────────────────────────────
if (fs.existsSync(festivalDir)) {
  console.error(`❌ festivals/${id} already exists. Aborting.`)
  process.exit(1)
}

fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(path.join(festivalDir, 'assets'), { recursive: true })
console.log(`✅ Created festivals/${id}/data/ and festivals/${id}/assets/`)

// ── 2. Stub data files ─────────────────────────────────────────────────────
fs.writeFileSync(path.join(dataDir, 'lineup.json'), JSON.stringify([], null, 2))
fs.writeFileSync(path.join(dataDir, 'poi.json'), JSON.stringify([], null, 2))
fs.writeFileSync(path.join(dataDir, 'guide.json'), JSON.stringify({ sections: [] }, null, 2))
fs.writeFileSync(path.join(dataDir, 'food.json'), JSON.stringify([], null, 2))
fs.writeFileSync(path.join(dataDir, 'store_meta.json'), JSON.stringify({}, null, 2))
console.log(`✅ Created empty data stubs in festivals/${id}/data/`)

// ── 3. config.json template ────────────────────────────────────────────────
const config = {
  id,
  slug,
  name,
  fullName: `${name} ${year}`,
  appName: `${name} Insider`,
  tagline: 'Your Festival, Your Way',
  description: `Your unofficial offline-first guide to ${name} ${year}.`,
  officialWebsite: `https://www.${slug}.com`,
  deepLinkScheme: `${slug}${year}`,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    translations: { en: {} }
  },
  aiPersona: `You are the AI scout for ${name} Festival.`,
  location: {
    city: 'TODO',
    country: 'TODO',
    countryCode: 'XX',
    venue: 'TODO',
    timezone: 'Europe/London',
    lat: 0,
    lng: 0,
    weatherDisplayName: 'TODO'
  },
  dates: {
    year: parseInt(year),
    startDate: `${year}-01-01`,
    endDate: `${year}-01-03`,
    days: ['wed', 'thu', 'fri'],
    dayLabels: {},
    openingDayFilter: `${year}-01-01`
  },
  currency: {
    localCode: 'EUR',
    localName: 'Euro',
    eurRate: 1,
    usdRate: 1.08,
    gbpRate: 0.86,
    showConverter: true
  },
  theme: {
    primaryHex: '#FF0080',
    primaryHsl: '320, 100%, 50%',
    accentHex: '#00C3FF',
    accentHsl: '195, 100%, 50%',
    secondaryHex: '#FFE600',
    secondaryHsl: '52, 100%, 50%',
    backgroundHex: '#0A0A0A',
    backgroundHsl: '0, 0%, 4%',
    cardHex: '#141414',
    cardHsl: '0, 0%, 8%',
    glowColor: 'rgba(255,0,128,0.3)',
    aesthetic: 'brutalist',
    androidPrimaryLong: '0xFFFF0080',
    androidAccentLong: '0xFF00C3FF',
    androidSecondaryLong: '0xFFFFE600'
  },
  features: {
    currencyConverter: true,
    tentFinder: false,
    vibeQuiz: true,
    aiRecommendations: true,
    survivalGuide: true,
    timetable: false,
    cashlessLink: false,
    dayparkNightpark: false,
    familyZone: false,
    hydrationTracker: false,
    sunscreenAlert: false,
    batterySaver: false,
    friendFinder: false,
    groupSchedules: false,
    artistTrivia: false,
    similarArtists: false,
    vibeOfTheHour: false,
    stageCapacity: false,
    merchCatalog: false,
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
    collabPlaylists: false,
    arStageView: false,
    fanPolls: false,
    photoWall: false,
    clashResolver: false,
    posterGenerator: false,
    customThemes: false,
    waterCounter: false,
    carFinder: false,
    notesJournal: false,
    socialFeed: false,
    newsBulletin: false,
    setCountdowns: false,
    surpriseRoulette: false,
    genreBreakdown: false,
    vibeAnalysis: false,
    accessibilityMap: false,
    quietZones: false,
    crowdHeatmap: false,
    secretStages: false,
    afterMovie: false,
    feedbackSystem: false,
    offlineBanner: true,
    audioMonitor: false,
    highContrast: false
  },
  content: {
    shuttleRoutes: [],
    dictionaryTerms: []
  }
}

fs.writeFileSync(path.join(festivalDir, 'config.json'), JSON.stringify(config, null, 2))
console.log(`✅ Created festivals/${id}/config.json`)

// ── 4. Register in festival-engine.ts ─────────────────────────────────────
const enginePath = path.join(ROOT, 'src', 'config', 'festival-engine.ts')
let engine = fs.readFileSync(enginePath, 'utf8')

const importLine = `import ${slug.replace(/-/g, '_')} from '../../festivals/${id}/config.json'`
const registryEntry = `  '${id}': ${slug.replace(/-/g, '_')} as FestivalConfig,`

if (engine.includes(importLine)) {
  console.log(`⚠️  Import for ${id} already exists in festival-engine.ts — skipping.`)
} else {
  // Insert import after last existing import block
  engine = engine.replace(
    /(import erntepunk from.*\n)/,
    `$1${importLine}\n`
  )
  // Insert registry entry after last existing entry
  engine = engine.replace(
    /('ernte-punk-2026': erntepunk as FestivalConfig,\n)/,
    `$1${registryEntry}\n`
  )
  fs.writeFileSync(enginePath, engine)
  console.log(`✅ Registered ${id} in src/config/festival-engine.ts`)
}

// ── 5. Add npm scripts to package.json ────────────────────────────────────
const pkgPath = path.join(ROOT, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const envPrefix = `NEXT_PUBLIC_FESTIVAL_ID=${id}`
const slugKey = slug.replace(/-/g, '')

const updateKey = `lineup:update:${slugKey}`
const androidKey = `android:sync:${slugKey}`

let changed = false
if (!pkg.scripts[updateKey]) {
  pkg.scripts[updateKey] = `${envPrefix} npm run lineup:update && ${envPrefix} npm run lineup:sync-android`
  changed = true
}
if (!pkg.scripts[androidKey]) {
  pkg.scripts[androidKey] = `${envPrefix} npm run lineup:sync-android`
  changed = true
}

if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`✅ Added ${updateKey} and ${androidKey} to package.json`)
}

// ── Done ───────────────────────────────────────────────────────────────────
console.log(`
✨ Festival "${id}" scaffolded successfully!

Next steps:
  1. Edit festivals/${id}/config.json — fill in location, dates, and theme
  2. Run: npm run lineup:scrape to populate the lineup
  3. Visit http://localhost:9002/${id} to see your festival
`)
