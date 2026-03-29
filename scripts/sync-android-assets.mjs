// scripts/sync-android-assets.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const slug = festivalId.replace(/-\d{4}$/, '') // "sziget-2026" → "sziget"
const srcDir = path.join('festivals', festivalId, 'data')
const destDir = path.join('android', 'app', 'src', slug, 'assets')

if (!fs.existsSync(srcDir)) {
  console.error(`Festival data directory not found: ${srcDir}`)
  process.exit(1)
}

fs.mkdirSync(destDir, { recursive: true })

for (const file of fs.readdirSync(srcDir)) {
  if (file.endsWith('.json')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
    console.log(`✓ Synced ${file} → android/app/src/${slug}/assets/`)
  }
}
console.log(`Android assets synced for: ${festivalId}`)
