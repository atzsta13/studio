import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const GENRE_TO_VIBES = {
  'TECHNO': ['Dance', 'Hard', 'Rave'],
  'ELECTRONIC': ['Dance', 'Flow'],
  'AMBIENT': ['Chill', 'Flow'],
  'METAL': ['Hard', 'High Energy'],
  'ROCK': ['High Energy', 'Anthemic'],
  'INDIE': ['Feel-good', 'Nostalgic'],
  'HIP-HOP': ['Party', 'Anthemic', 'Sing-along'],
  'HIP HOP': ['Party', 'Anthemic', 'Sing-along'],
  'RAP': ['Party', 'Anthemic'],
  'POP': ['Sing-along', 'Feel-good', 'Party'],
  'EXPERIMENTAL': ['Flow', 'Weird'],
  'JAZZ': ['Chill', 'Flow'],
  'DRUM AND BASS': ['Dance', 'Hard', 'High Energy'],
  'DNB': ['Dance', 'Hard', 'High Energy'],
  'HOUSE': ['Dance', 'Feel-good', 'Party'],
  'TRANCE': ['Dance', 'Rave'],
  'PUNK': ['Hard', 'High Energy'],
  'ALTERNATIVE': ['Feel-good', 'Anthemic'],
  'CLASSICAL': ['Chill'],
  'FOLK': ['Feel-good', 'Nostalgic'],
  'WORLD': ['Feel-good', 'Flow'],
  'REGGAE': ['Chill', 'Feel-good'],
  'TRAP': ['Party', 'Hard'],
  'R&B': ['Feel-good', 'Party', 'Sing-along'],
  'RNB': ['Feel-good', 'Party', 'Sing-along'],
  'SOUL': ['Feel-good', 'Nostalgic', 'Sing-along'],
  'DANCE': ['Dance', 'Party'],
  'CLUB': ['Dance', 'Party', 'Rave'],
  'BASS': ['Hard', 'Dance'],
  'BREAKBEAT': ['Dance', 'Hard'],
  'INDUSTRIAL': ['Hard', 'Dark'],
  'NOISE': ['Hard', 'Weird'],
  'PSYCHEDELIC': ['Flow', 'Weird'],
  'DISCO': ['Dance', 'Feel-good', 'Party'],
  'FUNK': ['Dance', 'Feel-good'],
  'AFROBEAT': ['Dance', 'Feel-good', 'Party'],
  'LATIN': ['Dance', 'Party'],
  'CUMBIA': ['Dance', 'Party'],
  'FLAMENCO': ['Feel-good', 'Anthemic'],
  'SYNTHWAVE': ['Dance', 'Nostalgic'],
  'EBM': ['Hard', 'Dance'],
  'HARDCORE': ['Hard', 'Rave'],
  'DUB': ['Chill', 'Flow'],
  'DREAM': ['Chill', 'Flow'],
  'SHOEGAZE': ['Chill', 'Nostalgic'],
  'GRUNGE': ['High Energy', 'Anthemic'],
  'EMO': ['Anthemic', 'Nostalgic'],
  'SINGER': ['Sing-along', 'Anthemic', 'Feel-good'],
  'SONGWRITER': ['Sing-along', 'Anthemic', 'Feel-good'],
}

function inferVibes(genres) {
  const vibes = new Set()
  for (const genre of genres) {
    const normalized = genre.toUpperCase().trim()
    for (const [key, tags] of Object.entries(GENRE_TO_VIBES)) {
      if (normalized.includes(key)) {
        tags.forEach(t => vibes.add(t))
      }
    }
  }
  return [...vibes]
}

function backfill(inputPath, outputPath) {
  const artists = JSON.parse(readFileSync(inputPath, 'utf8'))
  let filled = 0
  const updated = artists.map(a => {
    if (!a.vibes || a.vibes.length === 0) {
      const inferred = inferVibes(a.genres || [])
      if (inferred.length > 0) {
        filled++
        return { ...a, vibes: inferred }
      }
    }
    return a
  })
  writeFileSync(outputPath, JSON.stringify(updated, null, 2))
  console.log(`✓ ${inputPath.split('/').slice(-3).join('/')}: filled vibes for ${filled} artists`)
  return { total: artists.length, filled, stillEmpty: artists.filter(a => !a.vibes || a.vibes.length === 0).length - filled }
}

const root = join(__dirname, '..')
const r1 = backfill(
  join(root, 'src/data/lineup.json'),
  join(root, 'src/data/lineup.json')
)
const r2 = backfill(
  join(root, 'android/app/src/main/assets/lineup.json'),
  join(root, 'android/app/src/main/assets/lineup.json')
)

console.log(`\nSummary:`)
console.log(`  Web:     ${r1.filled} artists got vibes, ${r1.stillEmpty} still empty`)
console.log(`  Android: ${r2.filled} artists got vibes, ${r2.stillEmpty} still empty`)
