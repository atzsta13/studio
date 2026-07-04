// scripts/generate-manifest.mjs
import fs from 'fs'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/studio'

const manifest = {
  name: 'Festival Insider',
  short_name: 'Festival Insider',
  description: 'Your tactical companion for global festivals.',
  theme_color: '#000000',
  background_color: '#09090B',
  display: 'standalone',
  orientation: 'portrait',
  start_url: `${basePath}/`,
  icons: [
    { src: `${basePath}/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${basePath}/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
  ],
}

fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2))
console.log('✓ Generated neutral manifest.json')
