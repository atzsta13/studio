/**
 * show_lineup.js
 * 
 * Displays a formatted summary of lineup.json grouped by:
 * 1. Headliners (by day)
 * 2. Other artists (by day)
 * 3. Day TBD
 * 
 * Usage: node src/scripts/show_lineup.js
 */

const path = require('path');

const LINEUP_FILE = path.join(__dirname, '../data/lineup.json');
const DAY_ORDER = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function showLineup() {
    const data = require(LINEUP_FILE);

    // Separate headliners and others
    const headliners = data.filter(a => a.isHeadliner);
    const others = data.filter(a => !a.isHeadliner);

    // Group by day
    const headlinersByDay = new Map();
    const othersByDay = new Map();
    const noDay = [];

    headliners.forEach(a => {
        if (a.day) {
            if (!headlinersByDay.has(a.day)) headlinersByDay.set(a.day, []);
            headlinersByDay.get(a.day).push(a);
        }
    });

    others.forEach(a => {
        if (a.day) {
            if (!othersByDay.has(a.day)) othersByDay.set(a.day, []);
            othersByDay.get(a.day).push(a);
        } else {
            noDay.push(a);
        }
    });

    // Stats
    const withDay = data.filter(a => a.day);

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║               FESTIVAL LINEUP SUMMARY                  ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Total Artists:     ${data.length}`);
    console.log(`  Headliners:        ${headliners.length}`);
    console.log(`  With Day:          ${withDay.length}`);
    console.log(`  Day TBD:           ${noDay.length}`);
    console.log('');

    // ===== HEADLINERS SECTION =====
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                    ⭐ HEADLINERS ⭐                     ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    DAY_ORDER.forEach(day => {
        const artists = headlinersByDay.get(day) || [];
        if (!artists.length) return;

        console.log(`  📅 ${day.toUpperCase()}`);
        artists.sort((a, b) => a.artist.localeCompare(b.artist)).forEach(a => {
            const flag = a.countryCode ? ` [${a.countryCode}]` : '';
            console.log(`     🌟 ${a.artist}${flag}`);
        });
        console.log('');
    });

    // ===== OTHER ARTISTS SECTION =====
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                   🎵 LINEUP BY DAY                     ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    DAY_ORDER.forEach(day => {
        const artists = othersByDay.get(day) || [];
        if (!artists.length) return;

        console.log('┌────────────────────────────────────────────────────────┐');
        console.log(`│  📅 ${day.toUpperCase().padEnd(50)} │`);
        console.log('├────────────────────────────────────────────────────────┤');

        artists.sort((a, b) => a.artist.localeCompare(b.artist)).forEach(a => {
            const flag = a.countryCode ? ` [${a.countryCode}]` : '';
            const line = `🎵 ${a.artist}${flag}`;
            console.log(`│  ${line.substring(0, 54).padEnd(54)}│`);
        });

        console.log('└────────────────────────────────────────────────────────┘');
        console.log('');
    });

    // ===== DAY TBD SECTION =====
    if (noDay.length) {
        console.log('┌────────────────────────────────────────────────────────┐');
        console.log('│  ❓ DAY TBD                                            │');
        console.log('├────────────────────────────────────────────────────────┤');
        noDay.sort((a, b) => a.artist.localeCompare(b.artist)).forEach(a => {
            const flag = a.countryCode ? ` [${a.countryCode}]` : '';
            const line = `• ${a.artist}${flag}`;
            console.log(`│  ${line.substring(0, 54).padEnd(54)}│`);
        });
        console.log('└────────────────────────────────────────────────────────┘');
        console.log('');
    }
}

showLineup();
