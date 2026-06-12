import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, 'festivals/area53-2026/config.json');
const lineupPath = resolve(root, 'festivals/area53-2026/data/lineup.json');

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const lineup = JSON.parse(readFileSync(lineupPath, 'utf8'));

const { startDate, days } = config.dates;
const OFFSET = '+02:00';

const dateForDay = (day) => {
  let index = days.indexOf(day);
  if (index === -1 && day === 'Wednesday') index = -1; // warm-up day before startDate
  else if (index === -1) throw new Error(`Unknown day: ${day}`);
  const d = new Date(`${startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + index);
  return d.toISOString().slice(0, 10);
};

const nextDate = (date) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const isoRe = /^\d{4}-\d{2}-\d{2}T/;
const hhmmRe = /^\d{2}:\d{2}$/;

for (const artist of lineup) {
  const { day, startTime, endTime } = artist;
  if (!startTime && !endTime) continue;
  if (isoRe.test(startTime ?? '') || isoRe.test(endTime ?? '')) continue;
  if (!day) throw new Error(`Artist ${artist.id} has times but no day`);
  if (!hhmmRe.test(startTime) || !hhmmRe.test(endTime)) {
    throw new Error(`Artist ${artist.id} has unexpected time format: ${startTime} / ${endTime}`);
  }
  const date = dateForDay(day);
  const endDate = endTime <= startTime ? nextDate(date) : date;
  artist.startTime = `${date}T${startTime}:00${OFFSET}`;
  artist.endTime = `${endDate}T${endTime}:00${OFFSET}`;
}

writeFileSync(lineupPath, JSON.stringify(lineup, null, 2) + '\n');
console.log(`Migrated ${lineup.length} artists in ${lineupPath}`);
