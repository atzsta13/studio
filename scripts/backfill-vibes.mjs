import fs from 'fs';
import path from 'path';

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026';
const LINEUP_FILE = path.join(process.cwd(), `festivals/${festivalId}/data/lineup.json`);

const GENRE_VIBE_MAP = {
  'TECHNO': ['Dance', 'Hard', 'Rave'],
  'ELECTRONIC': ['Dance', 'Flow', 'Rave'],
  'AMBIENT': ['Chill', 'Flow'],
  'METAL': ['Hard', 'High Energy', 'Mosh'],
  'ROCK': ['High Energy', 'Anthemic'],
  'INDIE': ['Feel-good', 'Nostalgic'],
  'HIP-HOP': ['Party', 'Anthemic', 'Sing-along'],
  'RAP': ['Party', 'Hard'],
  'POP': ['Sing-along', 'Feel-good', 'Party'],
  'JAZZ': ['Chill', 'Flow'],
  'PUNK': ['Hard', 'High Energy', 'Mosh'],
  'HOUSE': ['Dance', 'Feel-good', 'Flow'],
  'ELECTRO-HOUSE': ['Dance', 'Party'],
  'BREAKBEAT': ['Dance', 'Rave'],
  'DRUM & BASS': ['Rave', 'High Energy', 'Dance'],
  'PSYTRANCE': ['Rave', 'Flow'],
  'REGGAE': ['Feel-good', 'Chill'],
  'FOLK': ['Acoustic', 'Chill', 'Nostalgic'],
};

function backfillVibes() {
  console.log(`🌀 Backfilling vibes for ${festivalId}...`);

  if (!fs.existsSync(LINEUP_FILE)) {
    console.error(`❌ Lineup file not found: ${LINEUP_FILE}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(LINEUP_FILE, 'utf8'));
  let updatedCount = 0;

  data.forEach(artist => {
    // Only backfill if vibes is empty or null
    if (!artist.vibes || artist.vibes.length === 0) {
      const newVibes = new Set();
      
      artist.genres?.forEach(genre => {
        const mappedVibes = GENRE_VIBE_MAP[genre.toUpperCase()];
        if (mappedVibes) {
          mappedVibes.forEach(v => newVibes.add(v));
        }
      });

      if (newVibes.size > 0) {
        artist.vibes = Array.from(newVibes);
        updatedCount++;
      } else {
        // Fallback for unknown genres
        artist.vibes = ['Discover'];
        updatedCount++;
      }
    }
  });

  console.log(`✅ Vibes backfilled for ${updatedCount} artists.`);
  fs.writeFileSync(LINEUP_FILE, JSON.stringify(data, null, 2), 'utf8');
}

backfillVibes();
