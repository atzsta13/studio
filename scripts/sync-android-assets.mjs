// scripts/sync-android-assets.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const slug = festivalId.replace(/-\d{4}$/, '').replace(/-/g, '') // "ernte-punk-2026" → "erntepunk"
const srcDataDir = path.join('festivals', festivalId, 'data')
const srcConfig = path.join('festivals', festivalId, 'config.json')
const destDir = path.join('android', 'app', 'src', slug, 'assets')

if (!fs.existsSync(srcDataDir)) {
  console.error(`Festival data directory not found: ${srcDataDir}`)
  process.exit(1)
}

fs.mkdirSync(destDir, { recursive: true })

// Copy and transform all JSON data
for (const file of fs.readdirSync(srcDataDir)) {
  if (file.endsWith('.json')) {
    const srcPath = path.join(srcDataDir, file)
    const destPath = path.join(destDir, file)
    
    if (file.startsWith('lineup')) {
      // Streamline Alignment: Transform "artist" key to "name" for Android compatibility
      try {
        const raw = fs.readFileSync(srcPath, 'utf8')
        const data = JSON.parse(raw)
        
        const transformArtist = (obj) => {
          if (Array.isArray(obj)) return obj.map(transformArtist)
          if (obj && typeof obj === 'object') {
            const newObj = {}
            for (const [key, value] of Object.entries(obj)) {
              const newKey = key === 'artist' ? 'name' : key
              newObj[newKey] = transformArtist(value)
            }
            return newObj
          }
          return obj
        }
        
        const transformed = transformArtist(data)
        fs.writeFileSync(destPath, JSON.stringify(transformed, null, 2))
        console.log(`✓ Synced & Transformed ${file} → android/app/src/${slug}/assets/`)
      } catch (e) {
        console.error(`Error transforming ${file}:`, e)
        fs.copyFileSync(srcPath, destPath)
      }
    } else {
      fs.copyFileSync(srcPath, destPath)
      console.log(`✓ Synced ${file} → android/app/src/${slug}/assets/`)
    }
  }
}

// Copy config.json
if (fs.existsSync(srcConfig)) {
  fs.copyFileSync(srcConfig, path.join(destDir, 'config.json'))
  console.log(`✓ Synced config.json → android/app/src/${slug}/assets/`)
}
console.log(`Android assets synced for: ${festivalId}`)
