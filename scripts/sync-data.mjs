// scripts/sync-data.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const src = path.join('festivals', festivalId, 'data')
const assetSrc = path.join('festivals', festivalId, 'assets')
const dest = path.join('src', 'data')
const publicDest = 'public'

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

// Sync Assets (Map, Icons, OG Images)
const assetsToSync = [
  { from: 'map.svg', to: 'map.svg' },
  { from: 'icon-192x192.png', to: 'icon-192x192.png' },
  { from: 'icon-512x512.png', to: 'icon-512x512.png' },
  { from: 'og-image.jpg', to: 'og-image.jpg' }
]

if (fs.existsSync(assetSrc)) {
  assetsToSync.forEach(asset => {
    const s = path.join(assetSrc, asset.from)
    const d = path.join(publicDest, asset.to)
    if (fs.existsSync(s)) {
      fs.copyFileSync(s, d)
      console.log(`✓ Synced asset: ${asset.from}`)
    }
  })
}

console.log(`Data package synced for: ${festivalId}`)
