// scripts/sync-android-assets.mjs
import fs from 'fs'
import path from 'path'
import { getFestivalPaths } from './utils/festival-env.mjs'

const paths = getFestivalPaths()
const { festivalId, slug, srcDataDir, srcConfig, androidAssetsDir: destDir } = paths

if (!fs.existsSync(srcDataDir)) {
  console.error(`Festival data directory not found: ${srcDataDir}`)
  process.exit(1)
}

fs.mkdirSync(destDir, { recursive: true })

// Copy all JSON data
for (const file of fs.readdirSync(srcDataDir)) {
  if (file.endsWith('.json')) {
    const srcPath = path.join(srcDataDir, file)
    const destPath = path.join(destDir, file)
    
    // Check if file is valid JSON
    try {
      const raw = fs.readFileSync(srcPath, 'utf8')
      if (raw.trim().startsWith('<')) {
        throw new Error('File appears to be HTML, not JSON')
      }
      JSON.parse(raw) // Just validate
      fs.copyFileSync(srcPath, destPath)
      console.log(`✓ Synced ${file} → android/app/src/${slug}/assets/`)
    } catch (e) {
      console.error(`Error syncing ${file}:`, e)
    }
  }
}

// Copy config.json
if (fs.existsSync(srcConfig)) {
  fs.copyFileSync(srcConfig, path.join(destDir, 'config.json'))
  console.log(`✓ Synced config.json → android/app/src/${slug}/assets/`)
}
console.log(`Android assets synced for: ${festivalId}`)
