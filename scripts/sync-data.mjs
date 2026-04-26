// scripts/sync-data.mjs
import fs from 'fs'
import path from 'path'
import { getFestivalId } from './utils/festival-env.mjs'
import { validateAllConfigs } from './utils/validate-configs.mjs'

const FESTIVALS_DIR = 'festivals'
const PUBLIC_DATA_DIR = path.join('public', 'data')

console.log('🚀 Starting White-Label Data Sync...')

// Ensure all configs are valid before proceeding
validateAllConfigs();

if (!fs.existsSync(FESTIVALS_DIR)) {
  console.error(`❌ Festivals directory not found: ${FESTIVALS_DIR}`)
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
  const srcConfig = path.join(festDir, 'config.json')
  const dest = path.join(PUBLIC_DATA_DIR, id)

  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

  // 1. Sync config.json
  if (fs.existsSync(srcConfig)) {
    fs.copyFileSync(srcConfig, path.join(dest, 'config.json'))
    console.log(`✓ [${id}] Synced config.json`)
  } else {
    console.warn(`⚠️ [${id}] config.json missing in source!`)
  }

  // 2. Sync lineup/data JSONs
  if (fs.existsSync(srcData)) {
    for (const file of fs.readdirSync(srcData)) {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(srcData, file), path.join(dest, file))
      }
    }
    console.log(`✓ [${id}] Synced data package`)
  }

  // 3. Sync Assets (Recursive)
  if (fs.existsSync(srcAssets)) {
    const assetDest = path.join(dest, 'assets')
    // Node 20+ supports recursive cpSync
    try {
      fs.cpSync(srcAssets, assetDest, { recursive: true, force: true })
      console.log(`✓ [${id}] Synced assets (recursive)`)
    } catch (e) {
      console.error(`❌ [${id}] Failed to sync assets: ${e.message}`)
    }
  }
}

// Legacy support: sync default festival to src/data
const defaultId = getFestivalId()
const legacySrc = path.join(FESTIVALS_DIR, defaultId, 'data')
const legacyDest = path.join('src', 'data')

if (fs.existsSync(legacySrc)) {
  if (!fs.existsSync(legacyDest)) fs.mkdirSync(legacyDest, { recursive: true })
  for (const file of fs.readdirSync(legacySrc)) {
    if (file.endsWith('.json')) {
      fs.copyFileSync(path.join(legacySrc, file), path.join(legacyDest, file))
    }
  }
  console.log(`✓ [${defaultId}] Synced legacy data (src/data)`)
}

console.log('✨ Data Sync Complete.')
