const fs = require('fs');
const path = require('path');

const lineupPath = path.join(__dirname, '../data/lineup.json');
const lineup = require(lineupPath);

// Improved Normalization helper
const normalizeKey = (str) => {
    if (!str) return '';
    let decoded = str;
    try {
        decoded = decodeURIComponent(str);
    } catch (e) {
        // keep original if decoding fails
    }
    // Decode HTML entities if any (basic check)
    decoded = decoded.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    // Remove all non-alphanumeric chars to merge similar names
    // e.g. "Florence + The Machine" == "Florence The Machine"
    // e.g. "Bbno$" == "Bbno"
    // e.g. "Bbno%24" -> "Bbno$" -> "Bbno"
    return decoded.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const artists = {};
let mergedCount = 0;

lineup.forEach(item => {
    const key = normalizeKey(item.artist);

    if (!artists[key]) {
        artists[key] = { ...item }; // Clone
    } else {
        const existing = artists[key];
        const incoming = item;

        console.log(`Merging ${item.artist} into ${existing.artist}`);

        // Merge logic

        // 1. Artist Name: Prefer decoded / cleaner version
        // If one has % (encoded), prefer the other
        const isEncoded = (s) => s.includes('%');
        if (isEncoded(existing.artist) && !isEncoded(incoming.artist)) {
            existing.artist = incoming.artist;
        } else if (!isEncoded(existing.artist) && isEncoded(incoming.artist)) {
            // keep existing
        } else {
            // Default length heuristic
            if (incoming.artist.length > existing.artist.length) existing.artist = incoming.artist;
        }

        // 3. Day / Stage / Time
        if (!existing.day && incoming.day) existing.day = incoming.day;
        if (!existing.stage && incoming.stage) existing.stage = incoming.stage;
        if (!existing.startTime && incoming.startTime) existing.startTime = incoming.startTime;
        if (!existing.endTime && incoming.endTime) existing.endTime = incoming.endTime;

        // 4. Details
        if (!existing.countryCode && incoming.countryCode) existing.countryCode = incoming.countryCode;

        // 5. Arrays (Union)
        const mergeArrays = (arr1, arr2) => [...new Set([...(arr1 || []), ...(arr2 || [])])];
        existing.genres = mergeArrays(existing.genres, incoming.genres);
        existing.vibes = mergeArrays(existing.vibes, incoming.vibes);

        // 6. Socials (Merge objects)
        existing.socials = { ...(existing.socials || {}), ...(incoming.socials || {}) };

        // 7. Description (Longest wins)
        if ((incoming.description?.length || 0) > (existing.description?.length || 0)) {
            existing.description = incoming.description;
        }

        // 8. Image (Prefer non-placeholder)
        const isPlaceholder = (url) => !url || url.includes('placeholder') || url.includes('default');
        if (isPlaceholder(existing.imageUrl) && !isPlaceholder(incoming.imageUrl)) {
            existing.imageUrl = incoming.imageUrl;
        }

        // 9. Links 
        if (!existing.festivalUrl && incoming.festivalUrl) existing.festivalUrl = incoming.festivalUrl;

        // 10. Headliner
        if (incoming.isHeadliner) existing.isHeadliner = true;

        mergedCount++;
    }
});

const cleaned = Object.values(artists);

console.log(`Original: ${lineup.length}`);
console.log(`Merged: ${cleaned.length}`);
console.log(`Duplicates consolidated: ${mergedCount}`);

// Sort A-Z for cleanliness
cleaned.sort((a, b) => a.artist.localeCompare(b.artist));

fs.writeFileSync(lineupPath, JSON.stringify(cleaned, null, 2));
console.log("Lineup merged and saved.");
