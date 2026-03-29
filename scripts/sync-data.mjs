// scripts/sync-data.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const src = path.join('festivals', festivalId, 'data')
const dest = path.join('src', 'data')

if (!fs.existsSync(src)) {
  console.error(`Festival data directory not found: ${src}`)
  process.exit(1)
}

// Ensure destination exists
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true })
}

// Copy JSON data files
for (const file of fs.readdirSync(src)) {
  if (file.endsWith('.json')) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file))
    console.log(`✓ Synced ${file}`)
  }
}

// Copy map asset if present
const mapSrc = path.join('festivals', festivalId, 'assets', 'map.svg')
const mapDest = path.join('public', 'map.svg')
if (fs.existsSync(mapSrc)) {
  fs.copyFileSync(mapSrc, mapDest)
  console.log('✓ Synced map.svg')
}

console.log(`Data package synced for: ${festivalId}`)
