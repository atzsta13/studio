// Enriches lineup.json with missing imageUrl (iTunes) and countryCode (MusicBrainz).
// Usage: node scripts/enrich-lineup.mjs
// Processes all festivals listed in FESTIVALS array below.

import fs from 'fs';
import path from 'path';

const FESTIVALS = [
  'frequency-2026',
  'novarock-2026',
  'ernte-punk-2026',
  'rock-am-ring-2026',
];

const MUSICBRAINZ_UA = 'FestivalInsiderPlatform/1.0 (stefan.atzlinger@gmail.com)';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchItunesImage(artistName) {
  try {
    // Step 1: get artistId
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=3`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const match = data.results?.find(r =>
      r.artistName?.toLowerCase() === artistName.toLowerCase()
    ) ?? data.results?.[0];
    if (!match?.artistId) return null;

    // Step 2: get album artwork via artist lookup
    await sleep(200);
    const lookupUrl = `https://itunes.apple.com/lookup?id=${match.artistId}&entity=album&limit=3`;
    const res2 = await fetch(lookupUrl);
    if (!res2.ok) return null;
    const data2 = await res2.json();
    const album = data2.results?.find(r => r.wrapperType === 'collection' && r.artworkUrl100);
    if (!album) return null;
    return album.artworkUrl100.replace('100x100bb', '600x600bb');
  } catch {
    return null;
  }
}

async function fetchMusicBrainzCountry(artistName) {
  const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json&limit=3`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': MUSICBRAINZ_UA }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const artists = data.artists ?? [];
    // Prefer exact name match
    const match = artists.find(a => a.name?.toLowerCase() === artistName.toLowerCase())
      ?? artists[0];
    if (!match) return null;
    // country field is a 2-letter ISO code
    if (match.country) return match.country.toUpperCase();
    // Fall back to area iso codes
    const iso = match.area?.['iso-3166-1-codes']?.[0];
    return iso ?? null;
  } catch {
    return null;
  }
}

async function enrichFestival(festivalId) {
  const lineupFile = path.join('festivals', festivalId, 'data', 'lineup.json');
  if (!fs.existsSync(lineupFile)) {
    console.log(`⚠️  ${festivalId}: lineup.json not found, skipping`);
    return;
  }

  const lineup = JSON.parse(fs.readFileSync(lineupFile, 'utf8'));
  const needsImage = lineup.filter(a => !a.imageUrl);
  const needsCountry = lineup.filter(a => !a.countryCode);

  console.log(`\n🎵 ${festivalId}: ${needsImage.length} missing images, ${needsCountry.length} missing countries`);

  let changed = 0;

  // --- Images via iTunes ---
  for (const artist of needsImage) {
    const img = await fetchItunesImage(artist.artist);
    if (img) {
      artist.imageUrl = img;
      changed++;
      console.log(`  ✓ image  ${artist.artist}`);
    } else {
      console.log(`  ✗ image  ${artist.artist}`);
    }
    await sleep(250);
  }

  // --- Country codes via MusicBrainz ---
  for (const artist of needsCountry) {
    const cc = await fetchMusicBrainzCountry(artist.artist);
    if (cc) {
      artist.countryCode = cc;
      changed++;
      console.log(`  ✓ country ${artist.artist} → ${cc}`);
    } else {
      console.log(`  ✗ country ${artist.artist}`);
    }
    await sleep(1100); // MusicBrainz: 1 req/sec
  }

  if (changed > 0) {
    fs.writeFileSync(lineupFile, JSON.stringify(lineup, null, 2));
    console.log(`  💾 Saved ${festivalId} (${changed} fields updated)`);
  } else {
    console.log(`  — No changes for ${festivalId}`);
  }
}

console.log('🚀 Starting lineup enrichment (iTunes + MusicBrainz)...');
for (const id of FESTIVALS) {
  await enrichFestival(id);
}
console.log('\n✨ Enrichment complete. Run npm run lineup:sync to propagate changes.');
