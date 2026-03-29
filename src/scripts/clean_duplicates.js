const fs = require('fs');
const path = require('path');

const lineupPath = path.join(__dirname, '../data/lineup.json');
const lineup = require(lineupPath);

const artists = {};
let duplicatesRemoved = 0;

lineup.forEach(item => {
    if (!artists[item.artist]) {
        artists[item.artist] = item;
    } else {
        const existing = artists[item.artist];
        const incoming = item;

        let replace = false;
        let reason = "";

        // logic: prefer enriched data
        const existingScore = (existing.day ? 10 : 0) + (existing.countryCode ? 5 : 0) + (existing.vibes?.length || 0);
        const incomingScore = (incoming.day ? 10 : 0) + (incoming.countryCode ? 5 : 0) + (incoming.vibes?.length || 0);

        if (incomingScore > existingScore) {
            replace = true;
            reason = "Score";
        } else if (incomingScore === existingScore) {
            // Tie-breaker: URL length (cleaner URL preferred)
            if (incoming.festivalUrl && existing.festivalUrl && incoming.festivalUrl.length < existing.festivalUrl.length) {
                replace = true;
                reason = "URL length";
            }
        }

        // Always prefer headliner status if present (though usually implies enriched)
        if (incoming.isHeadliner && !existing.isHeadliner) replace = true;
        if (existing.isHeadliner && !incoming.isHeadliner) replace = false;

        if (replace) {
            console.log(`Replacing ${item.artist} (${reason})`);
            artists[item.artist] = incoming;
        } else {
            console.log(`Keeping existing ${item.artist}`);
        }
        duplicatesRemoved++;
    }
});

const cleaned = Object.values(artists);
console.log(`Original: ${lineup.length}, Cleaned: ${cleaned.length}, Removed: ${duplicatesRemoved}`);

fs.writeFileSync(lineupPath, JSON.stringify(cleaned, null, 2));
console.log("Cleaned lineup saved.");
