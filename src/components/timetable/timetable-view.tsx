import { useMemo, useState, useEffect } from 'react';
import type { LineupItem } from '@/types';
import { useFavorites } from '@/hooks/use-favorites';
import ArtistCard from './artist-card';
import { Clock, Navigation } from 'lucide-react';
import {
    areNotificationsSupported,
    requestNotificationPermission,
    scheduleNotification,
    cancelNotification,
} from '@/lib/notifications';

const MIN_TIME = 12; // 12 PM
const MAX_TIME = 36; // 12 PM (the next day)

export default function TimetableView({ lineup }: { lineup: LineupItem[] }) {
    const { favorites, toggleFavorite, conflicts } = useFavorites(lineup);

    const [notificationsSupported, setNotificationsSupported] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (areNotificationsSupported()) {
            setNotificationsSupported(true);
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const handleRequestPermission = async () => {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
    };

    const handleToggleFavorite = (artist: LineupItem) => {
        const isFavorited = favorites.has(artist.id);
        toggleFavorite(artist.id);
        if (notificationPermission === 'granted') {
            if (!isFavorited) scheduleNotification(artist);
            else cancelNotification(artist.id);
        }
    };

    const { days, stages, timeSlots } = useMemo(() => {
        const sortedDays = [...new Set(lineup.map(item => item.day))].sort((a, b) =>
            new Date(lineup.find(l => l.day === a)!.startTime).getTime() -
            new Date(lineup.find(l => l.day === b)!.startTime).getTime()
        );
        const uniqueStages = [...new Set(lineup.map(item => item.stage))];
        const slots = Array.from({ length: (MAX_TIME - MIN_TIME) * 2 }, (_, i) => {
            const totalHour = MIN_TIME + Math.floor(i / 2);
            const displayHour = totalHour % 24;
            const minute = (i % 2) * 30;
            return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        });
        return { days: sortedDays, stages: uniqueStages, timeSlots: slots };
    }, [lineup]);

    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const activeDay = days[activeDayIdx];

    const getGridRow = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        let startHours = start.getUTCHours();
        if (startHours < MIN_TIME) startHours += 24;
        let endHours = end.getUTCHours();
        if (endHours < MIN_TIME) endHours += 24;
        const startMinutes = (startHours - MIN_TIME) * 60 + start.getUTCMinutes();
        const endMinutes = (endHours - MIN_TIME) * 60 + end.getUTCMinutes();
        return { gridRowStart: Math.floor(startMinutes / 15) + 2, gridRowEnd: Math.floor(endMinutes / 15) + 2 };
    };

    const dailyLineup = useMemo(() => {
        return lineup.filter(item => item.day === activeDay);
    }, [lineup, activeDay]);

    return (
        <div className="w-full bg-black min-h-screen text-white font-sans selection:bg-pink-500">
            {/* Brutalist Sticky Header */}
            <div className="sticky top-0 z-[100] bg-black/90 backdrop-blur-xl border-b border-white/10">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 gap-4">
                        {/* Custom Day Selector */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {days.map((day, idx) => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDayIdx(idx)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border-2 ${activeDayIdx === idx
                                        ? 'bg-pink-600 border-pink-600 text-white'
                                        : 'bg-transparent border-white/10 text-white/40 hover:text-white hover:border-white/30'
                                        }`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative overflow-x-auto no-scrollbar px-1 mt-4">
                <div
                    className="grid min-w-max gap-x-px"
                    style={{
                        gridTemplateColumns: `60px repeat(${stages.length}, 320px)`,
                        gridTemplateRows: `auto repeat(${(MAX_TIME - MIN_TIME) * 4}, 20px)`,
                    }}
                >
                    {/* Stage Row */}
                    <div className="sticky top-[64px] z-30 flex contents">
                        <div className="sticky top-[64px] left-0 z-40 bg-black border-r border-b border-white/10 h-10 flex items-center justify-center">
                            <Clock size={16} className="text-white opacity-20" />
                        </div>
                        {stages.map((stage, index) => (
                            <div
                                key={stage}
                                className="sticky top-[64px] z-30 flex items-center justify-center p-2 bg-black border-b border-white/10 h-10"
                                style={{ gridColumn: index + 2 }}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 whitespace-nowrap">
                                    {stage}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Time Column */}
                    {timeSlots.map((time, index) => (
                        index % 2 === 0 && (
                            <div
                                key={time}
                                className="sticky left-0 z-20 flex items-start justify-end pr-2 bg-black border-r border-white/10"
                                style={{
                                    gridRow: index * 2 + 2,
                                    gridRowEnd: `span 2`,
                                    gridColumn: 1,
                                    height: '40px'
                                }}
                            >
                                <span className="text-[10px] font-black text-white/20 tabular-nums leading-none pt-2">
                                    {time.endsWith(':00') ? time : ''}
                                </span>
                            </div>
                        )
                    ))}

                    {/* Artist Cards */}
                    {dailyLineup.map(item => {
                        const col = stages.indexOf(item.stage) + 2;
                        if (col === 1) return null;
                        return (
                            <div
                                key={item.id}
                                className="relative z-10"
                                style={{
                                    ...getGridRow(item.startTime, item.endTime),
                                    gridColumn: col,
                                }}
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

                    {/* Horizontal Grid Texture */}
                    {Array.from({ length: (MAX_TIME - MIN_TIME) * 2 }).map((_, i) => (
                        <div
                            key={i}
                            className="border-b border-white/[0.03] pointer-events-none"
                            style={{
                                gridRow: i * 2 + 2,
                                gridColumn: `2 / span ${stages.length}`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Floating Status Bar */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none flex flex-col items-center gap-2">
                {conflicts.size > 0 && (
                    <div className="bg-red-600 px-4 py-1 rounded-full shadow-2xl animate-pulse">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{conflicts.size} CLASHES DETECTED</span>
                    </div>
                )}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <span className="text-[9px] font-black text-white opacity-40 uppercase tracking-tighter">FAVE</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span className="text-[9px] font-black text-white opacity-40 uppercase tracking-tighter">GENRE</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Navigation size={12} className="text-white opacity-30" />
                        <span className="text-[9px] font-black text-white opacity-40 uppercase tracking-tighter">SCROLL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
