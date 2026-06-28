import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINEUP_FILE = path.join(__dirname, '..', 'festivals', 'sziget-2026', 'data', 'lineup.json');
const API_URL = 'https://widget.szigetfestival.com/v2//sziget-2026.json';

// Budapest is UTC+2 in August (CEST)
function toLocalISO(utcString) {
    const d = new Date(utcString);
    const offset = 2 * 60; // minutes
    const local = new Date(d.getTime() + offset * 60 * 1000);
    const iso = local.toISOString().replace('Z', '+02:00');
    return iso;
}

async function main() {
    console.log('📡 Fetching Appmiral schedule data...');
    const res = await fetch(API_URL);
    const data = await res.json();

    const placeById = new Map(data.places.map(p => [p.id, p.name_i18n?.en || p.name_i18n?.hu]));
    const artistById = new Map(data.artists.map(a => [a.id, a]));

    // performances keyed by artist_id (last one wins if multiple)
    const perfByArtistId = new Map();
    for (const perf of data.performances) {
        if (!perf.show_in_line_up) continue;
        perfByArtistId.set(perf.artist_id, perf);
    }

    console.log(`✅ ${data.performances.length} performances, ${data.artists.length} artists, ${data.places.length} places`);

    const lineup = JSON.parse(fs.readFileSync(LINEUP_FILE, 'utf8'));
    console.log(`📁 Loaded ${lineup.length} artists from lineup.json`);

    let updated = 0;
    let noMatch = 0;

    for (const artist of lineup) {
        if (!artist.festivalUrl) { noMatch++; continue; }

        // Extract numeric artist ID from URL slug: #/artist/2071969-some-name
        const match = artist.festivalUrl.match(/#\/artist\/(\d+)/);
        if (!match) { noMatch++; continue; }

        const apiArtistId = match[1];
        const perf = perfByArtistId.get(apiArtistId);

        if (!perf) {
            console.log(`  ⚠️  No performance found for: ${artist.artist} (id: ${apiArtistId})`);
            noMatch++;
            continue;
        }

        const stageName = placeById.get(perf.place_id);

        if (perf.start_time) artist.startTime = toLocalISO(perf.start_time);
        if (perf.end_time) artist.endTime = toLocalISO(perf.end_time);
        if (stageName) artist.stage = stageName;

        updated++;
    }

    fs.writeFileSync(LINEUP_FILE, JSON.stringify(lineup, null, 2), 'utf8');
    console.log(`\n✅ Updated ${updated} artists with times`);
    console.log(`⚠️  ${noMatch} artists had no API match`);
}

main().catch(err => { console.error(err); process.exit(1); });
