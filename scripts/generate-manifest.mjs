// scripts/generate-manifest.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const metaPath = path.join('festivals', festivalId, 'data', 'store_meta.json')

// Fallback config if store_meta is missing
const CONFIGS = {
  'sziget-2026': { appName: 'Sziget Insider', primaryHex: '#FF0080', backgroundHex: '#09090B' },
  'area53-2026': { appName: 'Area 53 Insider', primaryHex: '#CC0000', backgroundHex: '#09090B' },
  'novarock-2026': { appName: 'Nova Rock Insider', primaryHex: '#FF6600', backgroundHex: '#09090B' },
  'frequency-2026': { appName: 'Frequency Insider', primaryHex: '#8B00FF', backgroundHex: '#09090B' },
}

const baseConfig = CONFIGS[festivalId] || CONFIGS['sziget-2026']
let description = 'Your unofficial festival guide.'
let shortName = baseConfig.appName

if (fs.existsSync(metaPath)) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  description = meta.shortDescription || description
}

const manifest = {
  name: baseConfig.appName,
  short_name: shortName,
  description: description,
  theme_color: baseConfig.primaryHex,
  background_color: baseConfig.backgroundHex,
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  icons: [
    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
}

fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2))
console.log(`✓ Generated manifest.json for: ${festivalId} using store_meta.json`)
