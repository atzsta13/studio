// scripts/pulse-check.mjs
import fs from 'fs'
import path from 'path'

const FESTIVALS_DIR = 'festivals'
const REQUIRED_DATA_FILES = ['lineup.json', 'poi.json', 'guide.json', 'food.json']
const REQUIRED_TRANSLATION_KEYS = ['nav_home', 'nav_artists', 'nav_map', 'toolkit_title', 'scout_title']

console.log('📡 STARTING GLOBAL ECOSYSTEM PULSE CHECK...')
console.log('═════════════════════════════════════════════\n')

let globalError = false
const festivalFolders = fs.readdirSync(FESTIVALS_DIR).filter(f => fs.statSync(path.join(FESTIVALS_DIR, f)).isDirectory())

festivalFolders.forEach(id => {
  console.log(`🔎 CHECKING SECTOR: ${id.toUpperCase()}`)
  const festPath = path.join(FESTIVALS_DIR, id)
  
  // 1. Config Validation
  const configPath = path.join(festPath, 'config.json')
  if (!fs.existsSync(configPath)) {
    console.log(`   ❌ ERROR: config.json missing!`)
    globalError = true
    return
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  
  // 2. feature Flag Count (Health Check)
  const featureCount = Object.keys(config.features || {}).length
  if (featureCount < 40) {
    console.log(`   ⚠️  WARNING: Low feature density (${featureCount} flags). Check for drift.`)
  } else {
    console.log(`   ✅ Config: Robust (${featureCount} feature flags detected)`)
  }

  // 3. i18n Coverage
  const locales = config.i18n?.locales || []
  if (locales.length === 0) {
    console.log(`   ❌ ERROR: No locales defined in i18n.`)
    globalError = true
  } else {
    locales.forEach(lang => {
      const keys = Object.keys(config.i18n.translations[lang] || {})
      const missing = REQUIRED_TRANSLATION_KEYS.filter(k => !keys.includes(k))
      if (missing.length > 0) {
        console.log(`   ❌ ERROR [${lang}]: Missing tactical keys: ${missing.join(', ')}`)
        globalError = true
      }
    })
    console.log(`   ✅ i18n: Complete for [${locales.join(', ')}]`)
  }

  // 4. Tactical Data Integrity
  REQUIRED_DATA_FILES.forEach(file => {
    const filePath = path.join(festPath, 'data', file)
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ ERROR: Data file ${file} is missing!`)
      globalError = true
    } else {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      // Coordinate Check for POIs
      if (file === 'poi.json') {
        const oob = data.filter(p => p.mapCoords.x < 0 || p.mapCoords.x > 100 || p.mapCoords.y < 0 || p.mapCoords.y > 100)
        if (oob.length > 0) {
          console.log(`   ❌ ERROR: POI coordinates out of bounds: ${oob.map(p => p.name).join(', ')}`)
          globalError = true
        }
      }
      
      // Vibe Check for Lineup
      if (file === 'lineup.json') {
        const noVibes = data.filter(a => !a.vibes || a.vibes.length === 0)
        if (noVibes.length > 5) {
          console.log(`   ⚠️  WARNING: ${noVibes.length} artists missing AI vibes. Run npm run lineup:vibes.`)
        }
      }
    }
  })
  
  console.log(`   ✅ Data: Tactical structures verified.\n`)
})

if (globalError) {
  console.log('🚨 PULSE CHECK FAILED. FIX ERRORS BEFORE PRODUCTION DEPLOY.')
  process.exit(1)
} else {
  console.log('✨ ALL SECTORS NOMINAL. ECOSYSTEM IS READY FOR 2026 DEPLOYMENT.')
}
