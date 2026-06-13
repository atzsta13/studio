import { useInsider } from '@/components/layout/insider-provider';
import { useMemo, useState, useEffect, useRef } from 'react';
import type { LineupItem } from '@/types';
import ArtistCard from './artist-card';
import { Clock, AlertTriangle } from 'lucide-react';
import {
    areNotificationsSupported,
    timetableNotification,
    cancelTimetableNotification,
} from '@/lib/notifications';

const PX_PER_MIN = 2.4;
const GUTTER_PX = 52;
const MIN_COL_PX = 200;
const ROLLOVER_HOUR = 6;

// Wall-clock minutes at the venue, read straight from the ISO string —
// no Date/UTC conversion, so it can't drift with viewer timezone or DST.
function wallMinutes(iso: string): number {
    const h = parseInt(iso.slice(11, 13), 10);
    const m = parseInt(iso.slice(14, 16), 10);
    const total = h * 60 + m;
    return h < ROLLOVER_HOUR ? total + 24 * 60 : total;
}

function formatMinutes(mins: number): string {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

interface ScheduledItem extends LineupItem {
    startTime: string;
    endTime: string;
    stage: string;
    day: string;
}

export default function TimetableView({ lineup }: { lineup: LineupItem[] }) {
    const { favorites, toggleFavorite, conflicts, config } = useInsider();

    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [now, setNow] = useState<Date | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (areNotificationsSupported()) {
            setNotificationPermission(Notification.permission);
        }
        setNow(new Date());
        const tick = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(tick);
    }, []);

    const handleToggleFavorite = (artist: LineupItem) => {
        const isFavorited = favorites.has(artist.id);
        toggleFavorite(artist.id);
        if (notificationPermission === 'granted') {
            if (!isFavorited) timetableNotification(artist);
            else cancelTimetableNotification(artist.id);
        }
    };

    const scheduled = useMemo(
        () => lineup.filter(
            (item): item is ScheduledItem => !!(item.day && item.stage && item.startTime && item.endTime)
        ),
        [lineup]
    );

    const days = useMemo(() => {
        const firstDate = (d: string) =>
            scheduled.filter(i => i.day === d).map(i => i.startTime).sort()[0] ?? '';
        return [...new Set(scheduled.map(i => i.day))].sort((a, b) => firstDate(a).localeCompare(firstDate(b)));
    }, [scheduled]);

    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const activeDay = days[Math.min(activeDayIdx, Math.max(days.length - 1, 0))];

    const { dailyLineup, stages, dayStart, dayEnd, anchorDate } = useMemo(() => {
        const daily = scheduled.filter(item => item.day === activeDay);
        const stageNames = [...new Set(daily.map(i => i.stage))].sort((a, b) => {
            const main = (s: string) => /main|blue/i.test(s) ? 0 : 1;
            return main(a) - main(b) || a.localeCompare(b);
        });
        const starts = daily.map(i => wallMinutes(i.startTime));
        const ends = daily.map(i => wallMinutes(i.endTime));
        const start = starts.length ? Math.floor(Math.min(...starts) / 60) * 60 : 0;
        const end = ends.length ? Math.ceil(Math.max(...ends) / 60) * 60 : 0;
        const anchor = daily.map(i => i.startTime.slice(0, 10)).sort()[0] ?? '';
        return { dailyLineup: daily, stages: stageNames, dayStart: start, dayEnd: end, anchorDate: anchor };
    }, [scheduled, activeDay]);

    const totalMinutes = dayEnd - dayStart;
    const boardHeight = totalMinutes * PX_PER_MIN;

    // Now-line: only when the viewer's local date matches the active day's
    // venue date (festival-goers are on site, so local time == venue time).
    const nowOffset = useMemo(() => {
        if (!now || !anchorDate) return null;
        const pad = (n: number) => n.toString().padStart(2, '0');
        const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        let mins = now.getHours() * 60 + now.getMinutes();
        if (now.getHours() < ROLLOVER_HOUR) mins += 24 * 60;
        const dayAfterAnchor = new Date(`${anchorDate}T12:00:00`);
        dayAfterAnchor.setDate(dayAfterAnchor.getDate() + 1);
        const nextDate = `${dayAfterAnchor.getFullYear()}-${pad(dayAfterAnchor.getMonth() + 1)}-${pad(dayAfterAnchor.getDate())}`;
        const matchesAnchor = localDate === anchorDate;
        const matchesRollover = localDate === nextDate && now.getHours() < ROLLOVER_HOUR;
        if (!matchesAnchor && !matchesRollover) return null;
        if (mins < dayStart || mins > dayEnd) return null;
        return (mins - dayStart) * PX_PER_MIN;
    }, [now, anchorDate, dayStart, dayEnd]);

    // On day change, jump near the now-line if the day is live.
    useEffect(() => {
        if (nowOffset !== null && scrollRef.current) {
            scrollRef.current.scrollTo({ top: Math.max(nowOffset - 160, 0) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDay]);

    const hourMarks = useMemo(() => {
        const marks: number[] = [];
        for (let m = dayStart; m <= dayEnd; m += 60) marks.push(m);
        return marks;
    }, [dayStart, dayEnd]);

    const dayLabel = (day: string) => config.dates.dayLabels?.[day] ?? day.slice(0, 3);

    if (!days.length) return null;

    return (
        <div className="w-full bg-background min-h-screen text-foreground font-sans">
            <div className="sticky top-0 z-[100] bg-background/90 backdrop-blur-xl border-b border-border">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3">
                    {days.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border-2 ${activeDayIdx === idx
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                                }`}
                        >
                            {dayLabel(day)}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={scrollRef} className="overflow-auto no-scrollbar" style={{ maxHeight: 'calc(100dvh - 200px)' }}>
                <div className="relative min-w-max">
                    {/* Stage header row — sticky inside the scroll container */}
                    <div
                        className="sticky top-0 z-30 grid bg-background border-b border-border"
                        style={{ gridTemplateColumns: `${GUTTER_PX}px repeat(${stages.length}, minmax(${MIN_COL_PX}px, 1fr))` }}
                    >
                        <div className="h-11 flex items-center justify-center border-r border-border">
                            <Clock size={14} className="opacity-30" />
                        </div>
                        {stages.map(stage => (
                            <div key={stage} className="h-11 flex items-center justify-center px-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                                    {stage}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Time board */}
                    <div
                        className="relative grid"
                        style={{
                            gridTemplateColumns: `${GUTTER_PX}px repeat(${stages.length}, minmax(${MIN_COL_PX}px, 1fr))`,
                            height: boardHeight,
                        }}
                    >
                        {hourMarks.map(m => (
                            <div
                                key={m}
                                className="absolute left-0 right-0 border-t border-border/60 pointer-events-none"
                                style={{ top: (m - dayStart) * PX_PER_MIN }}
                            >
                                <span className="absolute left-0 w-[52px] -top-2 text-center text-[10px] font-black text-muted-foreground tabular-nums bg-background">
                                    {formatMinutes(m)}
                                </span>
                            </div>
                        ))}

                        <div className="border-r border-border" />

                        {stages.map(stage => (
                            <div key={stage} className="relative border-r border-border/30 last:border-r-0">
                                {dailyLineup
                                    .filter(item => item.stage === stage)
                                    .map(item => {
                                        const top = (wallMinutes(item.startTime) - dayStart) * PX_PER_MIN;
                                        const height = Math.max(
                                            (wallMinutes(item.endTime) - wallMinutes(item.startTime)) * PX_PER_MIN,
                                            34
                                        );
                                        return (
                                            <div
                                                key={item.id}
                                                className="absolute left-0 right-0 z-10"
                                                style={{ top, height }}
                                            >
                                                <ArtistCard
                                                    artist={item}
                                                    isFavorite={favorites.has(item.id)}
                                                    isConflicting={conflicts.has(item.id)}
                                                    onToggleFavorite={() => handleToggleFavorite(item)}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        ))}

                        {nowOffset !== null && (
                            <div
                                className="absolute left-0 right-0 z-20 pointer-events-none"
                                style={{ top: nowOffset }}
                            >
                                <div className="h-[2px] bg-destructive shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]" />
                                <span className="absolute left-1 -top-2 text-[9px] font-black uppercase tracking-widest text-destructive bg-background px-1">
                                    Now
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {conflicts.size > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                    <div className="bg-destructive px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-background/20">
                        <AlertTriangle size={14} className="text-destructive-foreground" />
                        <span className="text-[10px] font-black text-destructive-foreground uppercase tracking-widest">
                            {conflicts.size / 2} {conflicts.size === 2 ? 'CLASH' : 'CLASHES'} DETECTED
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
