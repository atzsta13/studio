import fs from 'fs';
import path from 'path';

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026';
const LINEUP_FILE = path.join(process.cwd(), `festivals/${festivalId}/data/lineup.json`);
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Known artist country codes
const ARTIST_COUNTRIES = {
    'bring me the horizon': 'GB',
    'florence + the machine': 'GB',
    'lewis capaldi': 'GB',
    'skrillex': 'US',
    'twenty one pilots': 'US',
    'tash sultana': 'AU',
    'bad nerves': 'GB',
    'biffy clyro': 'GB',
    'charlotte cardin': 'CA',
    'dijon': 'US',
    'indira paganotto': 'ES',
    'joris voorn': 'NL',
    'tash sultana': 'AU',
    'underworld': 'GB',
    'zimmer90': 'DE',
};

async function cleanLineup() {
    console.log(`🧹 Cleaning up lineup.json for ${festivalId}...`);

    if (!fs.existsSync(LINEUP_FILE)) {
        console.error(`❌ Lineup file not found: ${LINEUP_FILE}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(LINEUP_FILE, 'utf8'));
    console.log(`📄 Loaded ${data.length} artists.`);

    const cleanedData = [];
    const seenNames = new Map();

    for (let artist of data) {
        // 1. Decode name
        artist.artist = decodeURIComponent(artist.artist.replace(/\+/g, ' '));
        // Also fix specific cases like "Bbno%24" -> "bbno$"
        artist.artist = artist.artist.replace(/%24/g, '$');

        // 2. Extract day from genres if it's there
        if (artist.genres) {
            artist.genres = artist.genres.map(g => g.toUpperCase());
            const dayTag = artist.genres.find(g => DAYS.includes(g));
            if (dayTag && !artist.day) {
                artist.day = dayTag.charAt(0) + dayTag.slice(1).toLowerCase();
            }
            // Remove day from genres
            artist.genres = artist.genres.filter(g => !DAYS.includes(g));
        }

        // 3. Auto-fix country codes
        const lowerName = artist.artist.toLowerCase();
        if ((!artist.countryCode || artist.countryCode === 'null') && ARTIST_COUNTRIES[lowerName]) {
            artist.countryCode = ARTIST_COUNTRIES[lowerName];
        }

        // 4. Duplicate handling
        if (seenNames.has(lowerName)) {
            const existing = seenNames.get(lowerName);
            console.log(`  🔄 Duplicate found: ${artist.artist}`);
            
            // Merge logic: prefer source (newer/scraped) if target is missing info
            const merge = (target, source) => {
                // For Sziget 2026, we trust the newest scrape for stage/day
                target.stage = source.stage || target.stage;
                target.day = source.day || target.day;
                
                target.startTime = source.startTime || target.startTime;
                target.endTime = source.endTime || target.endTime;
                target.description = source.description || target.description;
                target.imageUrl = source.imageUrl || target.imageUrl;
                target.isHeadliner = target.isHeadliner || source.isHeadliner;
                
                if (source.genres && source.genres.length >= target.genres.length) {
                    target.genres = source.genres;
                }
                if (source.socials) {
                    target.socials = { ...source.socials, ...target.socials };
                }
                return target;
            };

            seenNames.set(lowerName, merge(existing, artist));
        } else {
            seenNames.set(lowerName, artist);
        }
    }

    const finalArtists = Array.from(seenNames.values());
    
    // Re-index IDs
    finalArtists.forEach((a, i) => {
        a.id = String(i + 1);
    });

    console.log(`✅ Cleaned up ${data.length} -> ${finalArtists.length} artists.`);
    fs.writeFileSync(LINEUP_FILE, JSON.stringify(finalArtists, null, 2), 'utf8');
}

cleanLineup();
