import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINEUP_FILE = path.join(__dirname, '..', 'festivals', 'sziget-2026', 'data', 'lineup.json');
const API_URL = 'https://widget.szigetfestival.com/v2//sziget-2026.json';

function toLocalISO(utcString) {
    const d = new Date(utcString);
    const local = new Date(d.getTime() + 2 * 60 * 60 * 1000);
    return local.toISOString().replace('Z', '+02:00');
}

function getDayFromStartTime(startTime) {
    if (!startTime) return null;
    const year = parseInt(startTime.slice(0, 4), 10);
    const month = parseInt(startTime.slice(5, 7), 10) - 1;
    const date = parseInt(startTime.slice(8, 10), 10);
    const hour = parseInt(startTime.slice(11, 13), 10);
    const minute = parseInt(startTime.slice(14, 16), 10);
    
    const d = new Date(year, month, date, hour, minute);
    d.setHours(d.getHours() - 6);
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[d.getDay()];
}

function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function buildSocials(links = {}) {
    const fb = links.facebook_page_id ? `https://www.facebook.com/${links.facebook_page_id}` : null;
    const ig = links.instagram_user ? `https://www.instagram.com/${links.instagram_user}` : null;
    const x = links.twitter_user ? `https://x.com/${links.twitter_user}` : null;
    const tt = links.tiktok_user ? `https://www.tiktok.com/@${links.tiktok_user}` : null;
    const yt = links.youtube_user
        ? `https://www.youtube.com/@${links.youtube_user}`
        : links.youtube_channel_id
        ? `https://www.youtube.com/channel/${links.youtube_channel_id}`
        : null;
    const spotify = links.spotify_artist_id
        ? `https://open.spotify.com/artist/${links.spotify_artist_id}`
        : null;
    const apple = links.applemusic_artist_id || null;
    const sc = links.soundcloud_user ? `https://soundcloud.com/${links.soundcloud_user}` : null;
    return { website: links.website || null, facebook: fb, instagram: ig, x, tiktok: tt, youtube: yt, spotify, appleMusic: apple, soundcloud: sc };
}

function parseTags(tags = []) {
    let countryCode = null;
    let day = null;
    const genres = [];
    for (const tag of tags) {
        if (tag.startsWith('country-')) {
            countryCode = tag.replace('country-', '').toUpperCase();
        } else if (tag.startsWith('day-')) {
            const d = tag.replace('day-', '');
            day = d.charAt(0).toUpperCase() + d.slice(1);
        } else if (tag.startsWith('genre-') || tag.startsWith('tag-')) {
            const slug = tag.replace(/^(genre-|tag-)/, '');
            const label = slug.replace(/-/g, ' ').toUpperCase();
            if (label !== 'MUSIC') genres.push(label);
        }
    }
    return { countryCode, day, genres };
}

async function main() {
    console.log('📡 Fetching Appmiral data...');
    const res = await fetch(API_URL);
    const data = await res.json();

    const placeById = new Map(data.places.map(p => [p.id, p.name_i18n?.en]));
    const perfByArtistId = new Map();
    for (const perf of data.performances) {
        if (perf.show_in_line_up) perfByArtistId.set(perf.artist_id, perf);
    }
    const apiArtistById = new Map(data.artists.map(a => [a.id, a]));

    console.log(`✅ ${data.artists.length} artists, ${data.performances.length} performances`);

    const existing = JSON.parse(fs.readFileSync(LINEUP_FILE, 'utf8'));
    console.log(`📁 ${existing.length} artists in lineup.json`);

    // Index existing by API artist ID (extracted from festivalUrl or name match)
    const coveredApiIds = new Set();
    for (const entry of existing) {
        const match = entry.festivalUrl?.match(/#\/artist\/(\d+)/);
        if (match) {
            coveredApiIds.add(match[1]);
        } else {
            const apiArtist = apiArtistById.get(entry.artist) || data.artists.find(a => a.name_i18n?.en === entry.artist);
            if (apiArtist) {
                coveredApiIds.add(apiArtist.id);
            }
        }
    }

    let updated = 0;
    let added = 0;
    let noMatch = 0;

    // Update existing entries from API
    const rebuilt = existing.map(entry => {
        let apiId = null;
        const match = entry.festivalUrl?.match(/#\/artist\/(\d+)/);
        if (match) {
            apiId = match[1];
        } else {
            const apiArtist = apiArtistById.get(entry.artist) || data.artists.find(a => a.name_i18n?.en === entry.artist);
            if (apiArtist) apiId = apiArtist.id;
        }

        if (!apiId) { noMatch++; return entry; }

        const apiArtist = apiArtistById.get(apiId);
        if (!apiArtist) { noMatch++; return entry; }

        const perf = perfByArtistId.get(apiId);
        const { countryCode, day, genres } = parseTags(apiArtist.tags);
        const description = stripHtml(apiArtist.body_i18n?.en);
        const imageUrl = apiArtist.image?.['1440'] || apiArtist.image?.['960'] || apiArtist.image?.full || entry.imageUrl;

        const startTime = perf?.start_time ? toLocalISO(perf.start_time) : entry.startTime;
        const derivedDay = startTime ? getDayFromStartTime(startTime) : (day || entry.day);

        updated++;
        return {
            id: entry.id,
            artist: apiArtist.name_i18n?.en || entry.artist,
            stage: perf ? (placeById.get(perf.place_id) || entry.stage) : entry.stage,
            day: derivedDay,
            startTime,
            endTime: perf?.end_time ? toLocalISO(perf.end_time) : entry.endTime,
            countryCode: countryCode || entry.countryCode,
            genres: genres.length ? genres : entry.genres,
            festivalUrl: entry.festivalUrl || `https://szigetfestival.com/#/artist/${apiId}`,
            socials: buildSocials(apiArtist.links),
            description: description || entry.description,
            imageUrl,
            vibes: entry.vibes || [],
            isHeadliner: entry.isHeadliner || false,
            returningHero: entry.returningHero || false,
            ...(entry.showInSchedule !== undefined ? { showInSchedule: entry.showInSchedule } : {})
        };
    });

    // Add API artists not yet in lineup
    let nextId = Math.max(...existing.map(a => parseInt(a.id) || 0)) + 1;
    for (const apiArtist of data.artists) {
        if (coveredApiIds.has(apiArtist.id)) continue;

        const perf = perfByArtistId.get(apiArtist.id);
        if (!perf) continue; // skip artists with no performance slot

        const { countryCode, day, genres } = parseTags(apiArtist.tags);
        const description = stripHtml(apiArtist.body_i18n?.en);
        const imageUrl = apiArtist.image?.['1440'] || apiArtist.image?.['960'] || apiArtist.image?.full || null;

        const startTime = perf.start_time ? toLocalISO(perf.start_time) : null;
        const derivedDay = startTime ? getDayFromStartTime(startTime) : day;

        rebuilt.push({
            id: String(nextId++),
            artist: apiArtist.name_i18n?.en || '',
            stage: placeById.get(perf.place_id) || null,
            day: derivedDay,
            startTime,
            endTime: perf.end_time ? toLocalISO(perf.end_time) : null,
            countryCode: countryCode || null,
            genres: genres.length ? genres : [],
            festivalUrl: `https://szigetfestival.com/#/artist/${apiArtist.id}`,
            socials: buildSocials(apiArtist.links),
            description: description || null,
            imageUrl,
            vibes: [],
            isHeadliner: false,
            returningHero: false,
        });
        added++;
    }

    // Sort by startTime, nulls last
    rebuilt.sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
    });

    fs.writeFileSync(LINEUP_FILE, JSON.stringify(rebuilt, null, 2), 'utf8');
    console.log(`\n✅ Updated: ${updated}, Added: ${added}, No API match: ${noMatch}`);
    console.log(`📦 Total: ${rebuilt.length} artists`);
}

main().catch(err => { console.error(err); process.exit(1); });
