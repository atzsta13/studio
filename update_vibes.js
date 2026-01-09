
const fs = require('fs');
const path = require('path');

const lineupPath = path.join(__dirname, 'src/data/lineup.json');
const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8'));

const vibeMap = {
    'ROCK': ['High Energy', 'Anthemic'],
    'PUNK': ['Moshpit', 'Rebellious'],
    'METAL': ['Moshpit', 'Aggressive'],
    'POP': ['Sing-along', 'Feel-good'],
    'INDIE': ['Chill', 'Atmospheric'],
    'ELECTRONIC': ['Dance', 'Rave'],
    'TECHNO': ['Dance', 'Hard'],
    'HOUSE': ['Dance', 'Groovy'],
    'HIP-HOP': ['Flow', 'Party'],
    'RAP': ['Flow', 'Party'],
    'ALTERNATIVE': ['Unique', 'Live Band'],
    'DNB': ['High Energy', 'Hard'],
};

// Manually override some big ones
const manualVibes = {
    'Florence + The Machine': ['Ethereal', 'Sing-along', 'Emotional'],
    'Lewis Capaldi': ['Emotional', 'Sing-along', 'Heartfelt'],
    'Twenty One Pilots': ['High Energy', 'Moshpit', 'Genre-bending'],
    'Ashnikko': ['Wild', 'Dance', 'Bold'],
    'bbno$': ['Funny', 'Party', 'Vibe'],
    'Biffy Clyro': ['Anthemic', 'Moshpit', 'Live Power'],
    'Tash Sultana': ['Loop-master', 'Trippy', 'Chill'],
    'Underworld': ['Legendary', 'Rave', 'Iconic'],
    'Dom Dolla': ['Banger', 'Dance', 'Summer'],
};

const updatedLineup = lineup.map(artist => {
    let vibes = manualVibes[artist.artist] || [];

    if (vibes.length === 0 && artist.genres) {
        artist.genres.forEach(genre => {
            const upperGenre = genre.toUpperCase();
            Object.keys(vibeMap).forEach(key => {
                if (upperGenre.includes(key)) {
                    vibeMap[key].forEach(v => {
                        if (!vibes.includes(v)) vibes.push(v);
                    });
                }
            });
        });
    }

    // Fallback
    if (vibes.length === 0) {
        vibes = ['Explore'];
    }

    return { ...artist, vibes };
});

fs.writeFileSync(lineupPath, JSON.stringify(updatedLineup, null, 2));
console.log('Lineup vibes updated!');
