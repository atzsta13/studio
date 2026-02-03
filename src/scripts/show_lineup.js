/**
 * show_lineup.js
 * 
 * Displays a formatted summary of lineup.json grouped by day
 * 
 * Usage: node src/scripts/show_lineup.js
 */

const path = require('path');

const LINEUP_FILE = path.join(__dirname, '../data/lineup.json');
const DAY_ORDER = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function showLineup() {
    const data = require(LINEUP_FILE);

    // Group by day
    const byDay = new Map();
    const noDay = [];

    data.forEach(a => {
        if (a.day) {
            if (!byDay.has(a.day)) byDay.set(a.day, []);
            byDay.get(a.day).push(a);
        } else {
            noDay.push(a);
        }
    });

    // Stats
    const scheduled = data.filter(a => a.stage && a.startTime);
    const withDay = data.filter(a => a.day);

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║            🎪 SZIGET 2026 LINEUP SUMMARY               ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Total Artists:     ${data.length}`);
    console.log(`  With Schedule:     ${scheduled.length} (stage + time)`);
    console.log(`  With Day Only:     ${withDay.length - scheduled.length}`);
    console.log(`  Day TBD:           ${noDay.length}`);
    console.log('');
    console.log('  Legend: ⭐ = Full schedule | 🎵 = Day only | • = TBD');
    console.log('');

    // Show each day
    DAY_ORDER.forEach(day => {
        const artists = byDay.get(day) || [];
        if (!artists.length) return;

        const dayScheduled = artists.filter(a => a.stage && a.startTime);
        const dayOnly = artists.filter(a => !a.stage || !a.startTime);

        console.log('┌────────────────────────────────────────────────────────┐');
        console.log(`│  📅 ${day.toUpperCase().padEnd(50)} │`);
        console.log('├────────────────────────────────────────────────────────┤');

        if (dayScheduled.length) {
            dayScheduled.sort((a, b) => a.artist.localeCompare(b.artist)).forEach(a => {
                const line = `⭐ ${a.artist} (${a.stage})`;
                console.log(`│  ${line.substring(0, 54).padEnd(54)}│`);
            });
        }

        if (dayOnly.length) {
            if (dayScheduled.length) console.log('│' + '─'.repeat(56) + '│');
            dayOnly.sort((a, b) => a.artist.localeCompare(b.artist)).forEach(a => {
                const line = `🎵 ${a.artist}`;
                console.log(`│  ${line.substring(0, 54).padEnd(54)}│`);
            });
        }

        console.log('└────────────────────────────────────────────────────────┘');
        console.log('');
    });

    // Show TBD
    if (noDay.length) {
        console.log('┌────────────────────────────────────────────────────────┐');
        console.log('│  ❓ DAY TBD                                            │');
        console.log('├────────────────────────────────────────────────────────┤');
        noDay.sort((a, b) => a.artist.localeCompare(b.artist)).forEach(a => {
            console.log(`│  • ${a.artist.substring(0, 52).padEnd(52)}│`);
        });
        console.log('└────────────────────────────────────────────────────────┘');
        console.log('');
    }
}

showLineup();
