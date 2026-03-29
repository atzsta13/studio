// scripts/generate-manifest.mjs
import fs from 'fs'

// Inline festival configs to avoid needing ts-node
const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'

const CONFIGS = {
  'sziget-2026': {
    appName: 'Sziget Insider 2026',
    name: 'Sziget',
    description: 'Your unofficial offline-first guide to Sziget Festival 2026.',
    primaryHex: '#FF0080',
    backgroundHex: '#09090B',
  },
  'area53-2026': {
    appName: 'Area 53 Insider 2026',
    name: 'Area 53',
    description: 'Your unofficial guide to Area 53 Metal Festival 2026.',
    primaryHex: '#CC0000',
    backgroundHex: '#09090B',
  },
  'novarock-2026': {
    appName: 'Nova Rock Insider 2026',
    name: 'Nova Rock',
    description: 'Your unofficial discovery guide to Nova Rock Festival 2026.',
    primaryHex: '#FF6600',
    backgroundHex: '#09090B',
  },
  'frequency-2026': {
    appName: 'Frequency Insider 2026',
    name: 'Frequency',
    description: 'Your unofficial guide to FM4 Frequency Festival 2026.',
    primaryHex: '#8B00FF',
    backgroundHex: '#09090B',
  },
}

const config = CONFIGS[festivalId]
if (!config) {
  console.error(`Unknown FESTIVAL_ID: ${festivalId}`)
  process.exit(1)
}

const manifest = {
  name: config.appName,
  short_name: config.name,
  description: config.description,
  theme_color: config.primaryHex,
  background_color: config.backgroundHex,
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  icons: [
    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
}

fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2))
console.log(`✓ Generated manifest.json for: ${festivalId}`)
