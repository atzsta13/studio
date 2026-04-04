// scripts/backfill-vibes.mjs
import fs from 'fs'
import path from 'path'
import { VIBE_TAXONOMY } from './vibe-taxonomy.mjs'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const lineupPath = path.join('festivals', festivalId, 'data', 'lineup.json')

if (!fs.existsSync(lineupPath)) {
  console.error(`lineup.json not found at ${lineupPath}`)
  process.exit(1)
}

const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8'))

function inferVibes(genres) {
  const vibes = new Set()
  for (const genre of genres ?? []) {
    const normalized = genre.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    
    // Direct match
    if (VIBE_TAXONOMY[normalized]) {
      VIBE_TAXONOMY[normalized].forEach(v => vibes.add(v))
    }
    
    // Partial match (e.g. "Heavy Metal" includes "METAL")
    for (const [key, tags] of Object.entries(VIBE_TAXONOMY)) {
      if (normalized.includes(key)) {
        tags.forEach(t => vibes.add(t))
      }
    }
  }
  return [...vibes]
}

let filledCount = 0
const updated = lineup.map(artist => {
  // Only fill if empty or if force is enabled
  const shouldFill = !artist.vibes || artist.vibes.length === 0 || process.env.FORCE_VIBES === 'true'
  if (shouldFill) {
    const inferred = inferVibes(artist.genres)
    if (inferred.length > 0) {
      filledCount++
      return { ...artist, vibes: inferred }
    }
  }
  return artist
})

fs.writeFileSync(lineupPath, JSON.stringify(updated, null, 2))
console.log(`✓ Vibes backfilled for ${filledCount} artists in ${festivalId} data package.`)

// Also sync to src/data immediately if this is the active festival
const destPath = path.join('src', 'data', 'lineup.json')
if (process.env.NEXT_PUBLIC_FESTIVAL_ID === festivalId || !process.env.NEXT_PUBLIC_FESTIVAL_ID) {
  fs.copyFileSync(lineupPath, destPath)
  console.log(`✓ Synced to src/data/lineup.json`)
}
