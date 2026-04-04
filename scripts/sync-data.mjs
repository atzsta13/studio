// scripts/sync-data.mjs
import fs from 'fs'
import path from 'path'

const FESTIVALS_DIR = 'festivals'
const PUBLIC_DATA_DIR = path.join('public', 'data')

if (!fs.existsSync(FESTIVALS_DIR)) {
  console.error(`Festivals directory not found: ${FESTIVALS_DIR}`)
  process.exit(1)
}

// Ensure destination exists
if (!fs.existsSync(PUBLIC_DATA_DIR)) {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true })
}

const festivalFolders = fs.readdirSync(FESTIVALS_DIR)

for (const id of festivalFolders) {
  const festDir = path.join(FESTIVALS_DIR, id)
  if (!fs.statSync(festDir).isDirectory()) continue

  const srcData = path.join(festDir, 'data')
  const srcAssets = path.join(festDir, 'assets')
  const dest = path.join(PUBLIC_DATA_DIR, id)

  if (fs.existsSync(srcData)) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    
    // Copy JSON files to public/data/[id]
    for (const file of fs.readdirSync(srcData)) {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(srcData, file), path.join(dest, file))
      }
    }
    console.log(`✓ Synced data for: ${id}`)
  }

  if (fs.existsSync(srcAssets)) {
    const assetDest = path.join(dest, 'assets')
    if (!fs.existsSync(assetDest)) fs.mkdirSync(assetDest, { recursive: true })
    
    for (const file of fs.readdirSync(srcAssets)) {
      fs.copyFileSync(path.join(srcAssets, file), path.join(assetDest, file))
    }
    console.log(`✓ Synced assets for: ${id}`)
  }
}

// Legacy support: sync default festival to src/data
const defaultId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const legacySrc = path.join(FESTIVALS_DIR, defaultId, 'data')
const legacyDest = path.join('src', 'data')

if (fs.existsSync(legacySrc)) {
  if (!fs.existsSync(legacyDest)) fs.mkdirSync(legacyDest, { recursive: true })
  for (const file of fs.readdirSync(legacySrc)) {
    if (file.endsWith('.json')) {
      fs.copyFileSync(path.join(legacySrc, file), path.join(legacyDest, file))
    }
  }
  console.log(`✓ Synced legacy data for: ${defaultId}`)
}
