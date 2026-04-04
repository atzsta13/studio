/**
 * clean_lineup.js
 * 
 * Cleans up lineup.json:
 * - Decodes URL-encoded names (e.g., %2B -> +)
 * - Removes duplicates (keeps entries with schedule data)
 * - Extracts day from genres if present
 * - Removes day tags from genres
 * - Adds missing country codes
 * 
 * Usage: node src/scripts/clean_lineup.js
 */

const fs = require('fs');
const path = require('path');

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026';
const LINEUP_FILE = path.join(__dirname, `../../festivals/${festivalId}/data/lineup.json`);
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Known artist country codes - add new artists here when needed
const ARTIST_COUNTRIES = {
    // Headliners
    'bring me the horizon': 'GB',
    'florence + the machine': 'GB',
    'lewis capaldi': 'GB',
    'twenty one pilots': 'US',
    'zara larsson': 'SE',
    'wolf alice': 'GB',
    'loyle carner': 'GB',
    'parcels': 'AU',

    // Electronic / DJ
    'nia archives': 'GB',
    'chet faker': 'AU',
    'boys noize': 'DE',
    'richie hawtin': 'CA',
    'sara landry': 'US',
    'dixon': 'DE',
    'dimension': 'GB',
    'sub focus': 'GB',
    'vintage culture': 'BR',
    'argy': 'GR',
    'whomadewho (hybrid dj set)': 'DK',
    'trym': 'NO',
    'funk tribu': 'ES',
    'dom dolla': 'AU',
    'indira paganotto': 'ES',
    'anna': 'BR',
    'joris voorn': 'NL',
    'pan pot': 'DE',
    'oskar med k': 'SE',
    'sim0ne': 'HU',
    'biia': 'BR',
    'jazzy': 'HU',
    'anetha': 'FR',
    'olympe': 'FR',
    'swimming paul': 'DE',
    'syreeta': 'GB',
    'tripolism': 'DE',
    'coco & breezy': 'US',

    // Rock / Alternative
    'ashnikko': 'US',
    'bbno$': 'CA',
    'biffy clyro': 'GB',
    'tash sultana': 'AU',
    'underworld': 'GB',
    'charlotte cardin': 'CA',
    'dijon': 'US',
    'alt blk era': 'GB',
    'baby lasagna': 'HR',
    'bad nerves': 'GB',
    'brooke combe': 'GB',
    'cassia': 'GB',
    "de'wayne": 'US',
    'giant rooks': 'DE',
    'kim dracula': 'US',
    'lambrini girls': 'GB',
    'paris paloma': 'GB',
    'antony szmierek': 'GB',
    'annisokay': 'DE',
    'avralize': 'NL',
    'health': 'US',
    'john coffey': 'NL',
    'leap': 'IE',
    'nation of language': 'US',
    'perturbator': 'FR',
    'rose gray': 'GB',
    'sylvie kreusch': 'BE',
    'golden hours': 'NL',
    'naika': 'FR',

    // Hungarian artists
    'elefant': 'HU',
    'karen dio': 'HU',
    'makrohang': 'HU',
    'sisi': 'HU',
    'ski aggu': 'DE',
    'sombr': 'HU',
    'tomora': 'HU',
    'zimmer90': 'HU',
    'analog balaton': 'HU',
    'beton.hofi': 'HU',
    'ivan & the parazol': 'HU',
    'kolibri': 'HU',
    'sef': 'HU',

    // Others
    '¥øu$uk€ ¥uk1mat$u': 'JP',
    'mehringer': 'AT',
};

// Main stage headliners - displayed prominently in the app
const HEADLINERS = [
    'bring me the horizon',
    'florence + the machine',
    'lewis capaldi',
    'jorja smith (party set)',
    'skepta',
    'sombr',
    'twenty one pilots',
    'zara larsson',
];

function cleanLineup() {
    console.log('🧹 Cleaning lineup.json...\n');

    const data = JSON.parse(fs.readFileSync(LINEUP_FILE, 'utf8'));
    const originalCount = data.length;

    // Step 1: Fix URL-encoded names
    console.log('1️⃣  Fixing URL-encoded names...');
    let encodingFixes = 0;
    data.forEach(a => {
        const original = a.artist;
        try {
            a.artist = decodeURIComponent(a.artist);
            if (a.artist !== original) {
                console.log(`   Fixed: ${original} → ${a.artist}`);
                encodingFixes++;
            }
        } catch (e) { }
    });
    console.log(`   ✓ Fixed ${encodingFixes} names\n`);

    // Step 2: Extract days from genres
    console.log('2️⃣  Extracting days from genres...');
    let dayExtractions = 0;
    data.forEach(a => {
        if (!a.day && a.genres && a.genres.length) {
            const dayInGenre = a.genres.find(g => DAYS.includes(g.toUpperCase()));
            if (dayInGenre) {
                a.day = dayInGenre.charAt(0).toUpperCase() + dayInGenre.slice(1).toLowerCase();
                console.log(`   ${a.artist} → ${a.day}`);
                dayExtractions++;
            }
        }
        // Clean day tags from genres for all artists
        if (a.genres && a.genres.length) {
            a.genres = a.genres.filter(g => !DAYS.includes(g.toUpperCase()));
        }
    });
    console.log(`   ✓ Extracted ${dayExtractions} days\n`);

    // Step 3: Deduplicate by artist name
    console.log('3️⃣  Removing duplicates...');
    const grouped = new Map();
    data.forEach(a => {
        const key = a.artist.toLowerCase();
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key).push(a);
    });

    const merged = [];
    let duplicatesRemoved = 0;

    for (const [name, artists] of grouped) {
        if (artists.length > 1) {
            console.log(`   Merging ${artists.length}x: ${artists[0].artist}`);
            duplicatesRemoved += artists.length - 1;
        }

        // Sort so scheduled entries come first
        artists.sort((a, b) => {
            const aScore = (a.day ? 1 : 0) + (a.stage ? 1 : 0) + (a.startTime ? 1 : 0);
            const bScore = (b.day ? 1 : 0) + (b.stage ? 1 : 0) + (b.startTime ? 1 : 0);
            return bScore - aScore;
        });

        // Take the best one and merge data from others
        const base = { ...artists[0] };
        for (let i = 1; i < artists.length; i++) {
            const other = artists[i];
            if (!base.description && other.description) base.description = other.description;
            if (!base.imageUrl && other.imageUrl) base.imageUrl = other.imageUrl;
            if ((!base.genres || !base.genres.length) && other.genres?.length) base.genres = other.genres;
            if (!base.day && other.day) base.day = other.day;
            if (!base.stage && other.stage) base.stage = other.stage;
            if (!base.countryCode && other.countryCode) base.countryCode = other.countryCode;
            if (other.socials) {
                if (!base.socials) base.socials = {};
                Object.keys(other.socials).forEach(k => {
                    if (!base.socials[k] && other.socials[k]) base.socials[k] = other.socials[k];
                });
            }
        }
        merged.push(base);
    }
    console.log(`   ✓ Removed ${duplicatesRemoved} duplicates\n`);

    // Step 4: Add missing country codes
    console.log('4️⃣  Adding country codes...');
    let countriesAdded = 0;
    const missingCountries = [];
    merged.forEach(a => {
        const key = a.artist.toLowerCase();
        if (!a.countryCode && ARTIST_COUNTRIES[key]) {
            a.countryCode = ARTIST_COUNTRIES[key];
            console.log(`   ${a.artist} → ${a.countryCode}`);
            countriesAdded++;
        } else if (!a.countryCode) {
            missingCountries.push(a.artist);
        }
    });
    console.log(`   ✓ Added ${countriesAdded} country codes`);
    if (missingCountries.length) {
        console.log(`   ⚠️  Missing: ${missingCountries.join(', ')}`);
    }
    console.log('');

    // Step 4.5: Normalize country codes
    console.log('🌍 Normalizing country codes...');
    merged.forEach(a => {
        if (a.countryCode) {
            const code = a.countryCode.trim().toUpperCase();
            if (code === 'UK' || code === 'SCO' || code === 'WAL' || code === 'ENG') {
                a.countryCode = 'GB';
            } else if (code === 'USA') {
                a.countryCode = 'US';
            } else {
                a.countryCode = code;
            }
        }
    });

    // Step 4.7: Delta District Stage Assignment
    console.log('🔺 Assigning stages...');
    let stagesAssigned = 0;
    merged.forEach(a => {
        const key = a.artist.toLowerCase();
        if (!a.stage) {
            if (HEADLINERS.includes(key)) {
                a.stage = 'Main Stage';
                stagesAssigned++;
            } else if (a.genres?.includes('DELTA DISTRICT')) {
                const desc = (a.description || '').toLowerCase();
                if (desc.includes('colosseum')) {
                    a.stage = 'Yettel Colosseum';
                } else if (desc.includes('the club')) {
                    a.stage = 'The Club';
                } else if (desc.includes('bolt')) {
                    a.stage = 'BOLT Night Stage';
                } else {
                    a.stage = 'Delta District';
                }
                stagesAssigned++;
            } else if (a.genres?.some(g => ['WORLD MUSIC', 'GLOBAL VILLAGE', 'FOLK', 'TRADITIONAL'].includes(g.toUpperCase())) || (a.description || '').toLowerCase().includes('global village')) {
                a.stage = 'Global Village';
                stagesAssigned++;
            } else if (a.genres?.some(g => ['HIP-HOP', 'RAP', 'BASS', 'D&B', 'DRUM & BASS'].includes(g.toUpperCase())) || (a.description || '').toLowerCase().includes('dropyard')) {
                a.stage = 'dropYard';
                stagesAssigned++;
            } else if ((a.description || '').toLowerCase().includes('revolut stage') || (a.description || '').toLowerCase().includes('freedome')) {
                a.stage = 'Revolut Stage';
                stagesAssigned++;
            }
        }
    });
    console.log(`   ✓ Assigned ${stagesAssigned} stages\n`);

    // Step 5: Mark headliners
    console.log('5️⃣  Marking headliners...');
    let headlinerCount = 0;
    merged.forEach(a => {
        const key = a.artist.toLowerCase();
        if (HEADLINERS.includes(key)) {
            a.isHeadliner = true;
            console.log(`   ⭐ ${a.artist}`);
            headlinerCount++;
        } else {
            a.isHeadliner = false;
        }
    });
    console.log(`   ✓ Marked ${headlinerCount} headliners\n`);

    // Step 6: Sort and reassign IDs
    console.log('6️⃣  Sorting and reassigning IDs...');
    merged.sort((a, b) => a.artist.localeCompare(b.artist));
    merged.forEach((a, i) => {
        a.id = String(i + 1);
    });
    console.log(`   ✓ Sorted alphabetically\n`);

    // Save
    fs.writeFileSync(LINEUP_FILE, JSON.stringify(merged, null, 2));

    console.log('═══════════════════════════════════════');
    console.log(`✅ DONE! ${originalCount} → ${merged.length} artists`);
    console.log('═══════════════════════════════════════');
}

cleanLineup();
