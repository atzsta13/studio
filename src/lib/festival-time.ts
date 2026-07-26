/**
 * Wall-clock time at the venue, for laying out a single festival day.
 *
 * Positions are read straight from the ISO string's characters, with no `Date`
 * parsing, so they cannot drift when the viewer's timezone or DST differs from
 * the festival's. Sets before {@link ROLLOVER_HOUR} belong to the previous
 * festival day, so a 02:00 set sorts *after* a 23:00 one.
 *
 * Only valid within one day. For comparisons across days — clash detection over
 * a whole week of favorites, for instance — use absolute instants instead
 * (`areSlotsOverlapping` in `lib/utils.ts`): two acts at 22:00 on different days
 * share a wall-minute but do not overlap.
 */

export const ROLLOVER_HOUR = 6;

export function wallMinutes(iso: string): number {
    const h = parseInt(iso.slice(11, 13), 10);
    const m = parseInt(iso.slice(14, 16), 10);
    const total = h * 60 + m;
    return h < ROLLOVER_HOUR ? total + 24 * 60 : total;
}

export function formatMinutes(mins: number): string {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
