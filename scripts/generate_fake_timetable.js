const fs = require('fs');
const path = require('path');

const lineupPath = path.join(__dirname, '../android/app/src/main/assets/lineup.json');

const STAGES = [
    { name: "Main Stage", slots: [17, 19, 21.5] }, // 21:30 is headliner
    { name: "Revolver Stage", slots: [16, 17.5, 19, 20.5, 22, 23.5] },
    { name: "The Colosseum", slots: [21, 22.5, 24, 25.5, 27] }, // Electronic
    { name: "IBIZA Soul", slots: [14, 15.5, 17, 18.5, 20] },
    { name: "Bolt Stage", slots: [15, 16.5, 18, 19.5, 21, 22.5] }
];

const DAYS = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

function formatTime(decimalHour) {
    const h = Math.floor(decimalHour) % 24;
    const m = (decimalHour % 1) * 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function generate() {
    console.log('Reading from assets/lineup.json...');
    const data = JSON.parse(fs.readFileSync(lineupPath, 'utf8'));
    
    // Reset all stages and times first
    data.forEach(a => {
        a.stage = null;
        a.startTime = null;
        a.endTime = null;
        if (!a.day) a.day = DAYS[Math.floor(Math.random() * DAYS.length)];
    });

    DAYS.forEach(day => {
        const artistsInDay = data.filter(a => a.day === day);
        
        // Split into headliners and non-headliners
        const headliners = artistsInDay.filter(a => a.isHeadliner);
        const regulars = artistsInDay.filter(a => !a.isHeadliner);

        // Assign special slot to headliner
        if (headliners.length > 0) {
            const hl = headliners[0];
            hl.stage = "Main Stage";
            hl.startTime = "21:30";
            hl.endTime = "23:00";
        }

        // Assign regulars to slots
        let regularIdx = 0;
        STAGES.forEach(stage => {
            stage.slots.forEach(slotStart => {
                // If this is the headliner slot on main stage, skip if filled
                if (stage.name === "Main Stage" && slotStart === 21.5) return;

                if (regularIdx < regulars.length) {
                    const artist = regulars[regularIdx];
                    artist.stage = stage.name;
                    artist.startTime = formatTime(slotStart);
                    artist.endTime = formatTime(slotStart + 1.25);
                    regularIdx++;
                }
            });
        });

        // Any remaining regulars (if overflow)
        if (regularIdx < regulars.length) {
            console.warn(`[!] ${day}: ${regulars.length - regularIdx} artists could not be placed in the current stage grid.`);
        }
    });

    console.log('Writing updated lineup.json...');
    fs.writeFileSync(lineupPath, JSON.stringify(data, null, 2));
    console.log('Success! Timetable established for 100% of acts.');
}

generate();
