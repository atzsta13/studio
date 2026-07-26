import { useInsider } from '@/components/layout/insider-provider';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { LineupItem, ScheduledSlot } from '@/types';
import ArtistCard from './artist-card';
import TimetableList from './timetable-list';
import PillButton from './pill-button';
import ZoomCluster from './zoom-cluster';
import { Clock, AlertTriangle, Heart, Target, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    BASE_COL_PX,
    BASE_PX_PER_MIN,
    GUTTER_PX,
    HEADER_PX,
    ZOOM_STEP,
    fitWidthZoom,
    fitZoom,
    useTimetableZoom,
} from '@/hooks/use-timetable-zoom';
import { useTimetableGestures } from '@/hooks/use-timetable-gestures';
import { useTimetableViewport } from '@/hooks/use-timetable-viewport';
import { ROLLOVER_HOUR, formatMinutes, wallMinutes } from '@/lib/festival-time';

export default function TimetableView({ lineup, festivalId }: { lineup: LineupItem[]; festivalId: string }) {
    const { favorites, toggleFavorite, conflicts, config, getFavoriteTier } = useInsider();

    const [now, setNow] = useState<Date | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [hiddenStages, setHiddenStages] = useState<Set<string>>(new Set());
    const [query, setQuery] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitializedRef = useRef(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { zoom, setZoom, setZoomTransient, hydrated: zoomHydrated, hadStored: hadStoredZoom } = useTimetableZoom(festivalId);
    // Any deliberate zoom (button, pinch, wheel, key) switches the grid off
    // auto-fit, so the chosen density survives day switches.
    const userZoomedRef = useRef(false);
    const setZoomByUser = useCallback((next: number | ((current: number) => number)) => {
        userZoomedRef.current = true;
        setZoom(next);
    }, [setZoom]);
    const zoomIn = useCallback(() => setZoomByUser(z => z * ZOOM_STEP), [setZoomByUser]);
    const zoomOut = useCallback(() => setZoomByUser(z => z / ZOOM_STEP), [setZoomByUser]);
    const pxPerMin = BASE_PX_PER_MIN * zoom;
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        setNow(new Date());
        const tick = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(tick);
    }, []);

    const handleToggleFavorite = (artist: LineupItem) => {
        toggleFavorite(artist.id);
    };

    const toggleStage = useCallback((stage: string) => {
        setHiddenStages(prev => {
            const next = new Set(prev);
            if (next.has(stage)) next.delete(stage);
            else next.add(stage);
            return next;
        });
    }, []);

    const scheduled = useMemo(
        () => lineup.filter(
            (item): item is ScheduledSlot => !!(item.day && item.stage && item.startTime && item.endTime) && item.showInSchedule !== false
        ),
        [lineup]
    );

    const days = useMemo(() => {
        const configDays = config.dates.days ?? [];
        const firstDate = (d: string) =>
            scheduled.filter(i => i.day === d).map(i => i.startTime).sort()[0] ?? '';
        return [...new Set(scheduled.map(i => i.day))].sort((a, b) => {
            const ai = configDays.indexOf(a);
            const bi = configDays.indexOf(b);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return firstDate(a).localeCompare(firstDate(b));
        });
    }, [scheduled, config.dates.days]);

    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const activeDay = days[Math.min(activeDayIdx, Math.max(days.length - 1, 0))];

    useEffect(() => {
        if (!now || days.length === 0 || hasInitializedRef.current) return;
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        const adjustedNow = new Date(now.getTime());
        if (adjustedNow.getHours() < ROLLOVER_HOUR) {
            adjustedNow.setDate(adjustedNow.getDate() - 1);
        }
        const localDate = `${adjustedNow.getFullYear()}-${pad(adjustedNow.getMonth() + 1)}-${pad(adjustedNow.getDate())}`;
        
        const matchIdx = days.findIndex(day => {
            const daily = scheduled.filter(item => item.day === day && item.startTime);
            const anchor = daily.map(i => i.startTime.slice(0, 10)).sort()[0];
            return anchor === localDate;
        });
        
        if (matchIdx !== -1) {
            setActiveDayIdx(matchIdx);
        }
        hasInitializedRef.current = true;
    }, [now, days, scheduled]);

    const { allStages, dayStart, dayEnd, anchorDate } = useMemo(() => {
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
        return { allStages: stageNames, dayStart: start, dayEnd: end, anchorDate: anchor };
    }, [scheduled, activeDay]);

    // Reset hidden stages when day changes (new day may have different stages)
    useEffect(() => {
        setHiddenStages(new Set());
    }, [activeDay]);

    const stages = useMemo(
        () => allStages.filter(s => !hiddenStages.has(s)),
        [allStages, hiddenStages]
    );

    const { toolbarRef, topInset, stickyHeaderTop, boardMaxHeight } =
        useTimetableViewport(scrollRef, allStages.length);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        setViewportWidth(el.clientWidth);
        const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, [viewMode]);

    // Zoomed-out columns stretch to fill the container instead of leaving dead
    // space — a 3-stage festival should never render as a thin strip.
    const colWidth = useMemo(() => {
        const scaled = BASE_COL_PX * zoom;
        if (stages.length === 0 || viewportWidth === 0) return scaled;
        return Math.max(scaled, Math.floor((viewportWidth - GUTTER_PX) / stages.length));
    }, [zoom, stages.length, viewportWidth]);

    const trimmedQuery = query.trim().toLowerCase();
    const dailyLineup = useMemo(() => {
        const daily = scheduled.filter(item => item.day === activeDay);
        const favFiltered = showFavoritesOnly ? daily.filter(item => favorites.has(item.id)) : daily;
        const stageFiltered = favFiltered.filter(item => !hiddenStages.has(item.stage));
        if (!trimmedQuery) return stageFiltered;
        return stageFiltered.filter(item => item.artist.toLowerCase().includes(trimmedQuery));
    }, [scheduled, activeDay, showFavoritesOnly, favorites, hiddenStages, trimmedQuery]);

    const byStage = useMemo(() => {
        const groups = new Map<string, ScheduledSlot[]>();
        dailyLineup.forEach(item => {
            const bucket = groups.get(item.stage);
            if (bucket) bucket.push(item);
            else groups.set(item.stage, [item]);
        });
        return groups;
    }, [dailyLineup]);

    const listLineup = useMemo(() => {
        return [...dailyLineup].sort((a, b) => {
            const startA = wallMinutes(a.startTime);
            const startB = wallMinutes(b.startTime);
            if (startA !== startB) return startA - startB;
            return a.stage.localeCompare(b.stage);
        });
    }, [dailyLineup]);

    const groupedList = useMemo(() => {
        const groups: { time: string; items: ScheduledSlot[] }[] = [];
        listLineup.forEach(item => {
            const timeStr = item.startTime.slice(11, 16);
            let existing = groups.find(g => g.time === timeStr);
            if (!existing) {
                existing = { time: timeStr, items: [] };
                groups.push(existing);
            }
            existing.items.push(item);
        });
        return groups;
    }, [listLineup]);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 5);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        checkScroll();
        window.addEventListener('resize', checkScroll);
        el.addEventListener('scroll', checkScroll);
        
        return () => {
            window.removeEventListener('resize', checkScroll);
            el.removeEventListener('scroll', checkScroll);
        };
    }, [checkScroll, stages, dailyLineup]);

    const totalMinutes = dayEnd - dayStart;
    const boardHeight = totalMinutes * pxPerMin;

    const { isPanning } = useTimetableGestures({
        containerRef: scrollRef,
        zoom,
        setZoom: setZoomByUser,
        gutterPx: GUTTER_PX,
        enabled: viewMode === 'grid',
    });

    const fitAll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        // The container is height-capped, not height-fixed, so once zoomed out
        // its clientHeight follows the content. Fit against the cap instead,
        // or FIT would ratchet the zoom down every time it is pressed.
        const cap = Number.parseFloat(window.getComputedStyle(el).maxHeight);
        setZoomByUser(fitZoom({
            containerWidth: el.clientWidth,
            containerHeight: Number.isFinite(cap) ? cap : el.clientHeight,
            stageCount: stages.length,
            totalMinutes,
        }));
        el.scrollTo({ top: 0, left: 0 });
    }, [setZoomByUser, stages.length, totalMinutes]);

    // Until the user zooms for themselves, keep every stage column on screen —
    // an 18-stage Sziget day on a phone is unusable at 100%.
    useEffect(() => {
        if (!zoomHydrated || hadStoredZoom || userZoomedRef.current) return;
        const el = scrollRef.current;
        if (!el || stages.length === 0 || el.clientWidth === 0) return;
        setZoomTransient(
            el.clientWidth < GUTTER_PX + stages.length * BASE_COL_PX
                ? fitWidthZoom(el.clientWidth, stages.length)
                : 1
        );
    }, [zoomHydrated, hadStoredZoom, stages.length, viewportWidth, activeDay, setZoomTransient]);

    // Keyboard zoom, ignored while the search field has focus.
    useEffect(() => {
        if (viewMode !== 'grid') return;
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
            if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
            else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomOut(); }
            else if (e.key === '0') { e.preventDefault(); setZoomByUser(1); }
            else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); fitAll(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [viewMode, zoomIn, zoomOut, setZoomByUser, fitAll]);

    // Current wall-minute at the venue, only when the viewer's local date
    // matches the active day's venue date (festival-goers are on site, so
    // local time == venue time). Null on any other day.
    const nowWallMinutes = useMemo(() => {
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
        return mins;
    }, [now, anchorDate]);

    // Now-line pixel offset — only when the live minute falls inside the board.
    const nowOffset = useMemo(() => {
        if (nowWallMinutes === null || nowWallMinutes < dayStart || nowWallMinutes > dayEnd) return null;
        return (nowWallMinutes - dayStart) * pxPerMin;
    }, [nowWallMinutes, dayStart, dayEnd, pxPerMin]);

    const jumpToNow = useCallback(() => {
        if (nowOffset !== null && scrollRef.current) {
            scrollRef.current.scrollTo({ top: Math.max(nowOffset - 160, 0), behavior: 'smooth' });
        }
    }, [nowOffset]);

    // On day change, jump near the now-line if the day is live.
    useEffect(() => {
        if (nowOffset !== null && scrollRef.current) {
            scrollRef.current.scrollTo({ top: Math.max(nowOffset - 160, 0) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDay]);

    // One definition of live/past for both views.
    const liveState = useCallback((item: ScheduledSlot) => {
        if (nowWallMinutes === null) return { isLive: false, isPast: false };
        const start = wallMinutes(item.startTime);
        const end = wallMinutes(item.endTime);
        return {
            isLive: start <= nowWallMinutes && nowWallMinutes < end,
            isPast: end <= nowWallMinutes,
        };
    }, [nowWallMinutes]);

    const hourMarks = useMemo(() => {
        const marks: number[] = [];
        for (let m = dayStart; m <= dayEnd; m += 60) marks.push(m);
        return marks;
    }, [dayStart, dayEnd]);

    // Zoomed out, hourly labels collide — thin them out but keep the lines.
    const hourHeight = 60 * pxPerMin;
    const labelStepHours = hourHeight < 26 ? 3 : hourHeight < 44 ? 2 : 1;

    const dayLabel = (day: string) => config.dates.dayLabels?.[day] ?? day.slice(0, 3);

    const favCount = useMemo(
        () => scheduled.filter(i => i.day === activeDay && favorites.has(i.id)).length,
        [scheduled, activeDay, favorites]
    );

    if (!days.length) return null;



    return (
        // No min-h-screen: any page height beyond the toolbar + capped board is
        // scroll slack that would drag the board's sticky stage header out of view.
        <div className="w-full bg-background text-foreground font-sans">
            {/* Pins under the global site header; the board below is capped to
                the space that leaves, so its own sticky stage header can never
                slide out of view behind this toolbar. */}
            <div ref={toolbarRef} className="sticky z-[100] bg-background/90 backdrop-blur-xl border-b border-border" style={{ top: topInset }}>
                {/* Day tabs + controls row */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                        {days.map((day, idx) => (
                            <PillButton key={day} onClick={() => setActiveDayIdx(idx)} active={activeDayIdx === idx}>
                                {dayLabel(day)}
                            </PillButton>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {nowOffset !== null && (
                            <PillButton onClick={jumpToNow} tone="danger">
                                <Target size={10} />
                                NOW
                            </PillButton>
                        )}
                        <PillButton onClick={() => setViewMode(m => m === 'grid' ? 'list' : 'grid')}>
                            {viewMode === 'grid' ? 'LIST' : 'GRID'}
                        </PillButton>
                        <PillButton onClick={() => setShowFavoritesOnly(v => !v)} active={showFavoritesOnly}>
                            <Heart size={10} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                            {favCount > 0 ? favCount : 'FAV'}
                        </PillButton>
                    </div>
                </div>

                {/* Artist search */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
                    <div className="relative flex-1">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                        <input
                            type="text"
                            inputMode="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search artists…"
                            className="w-full bg-muted/40 border border-border rounded-full pl-9 pr-9 py-1.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium focus:outline-none focus:border-primary/60"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {viewMode === 'grid' && (
                        <ZoomCluster zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onFit={fitAll} />
                    )}
                </div>

                {/* Stage filter pills */}
                {allStages.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 py-2">
                        {allStages.map(stage => (
                            <PillButton
                                key={stage}
                                onClick={() => toggleStage(stage)}
                                size="sm"
                                muted={hiddenStages.has(stage)}
                            >
                                {stage}
                            </PillButton>
                        ))}
                    </div>
                )}
            </div>

            {showFavoritesOnly && favCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
                    <Heart size={32} className="opacity-20" />
                    <span className="text-[11px] font-black uppercase tracking-widest">No favourites on this day</span>
                    <span className="text-[10px] text-muted-foreground/50">Tap the heart on any artist to add them</span>
                </div>
            ) : trimmedQuery && dailyLineup.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
                    <Search size={32} className="opacity-20" />
                    <span className="text-[11px] font-black uppercase tracking-widest">No artists match “{query.trim()}”</span>
                    <span className="text-[10px] text-muted-foreground/50">Try another name or a different day</span>
                </div>
            ) : viewMode === 'list' ? (
                <TimetableList
                    groups={groupedList}
                    festivalId={festivalId}
                    maxHeight={boardMaxHeight}
                    isFavorite={id => favorites.has(id)}
                    favoriteTier={getFavoriteTier}
                    isConflicting={id => conflicts.has(id)}
                    liveState={liveState}
                    onToggleFavorite={handleToggleFavorite}
                />
            ) : (
            <div className="relative">
                {canScrollLeft && (
                    <>
                        <div className="absolute left-[52px] top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r from-background to-transparent z-20" />
                        <div className="absolute left-[64px] top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-background/80 border border-border shadow-lg animate-pulse pointer-events-none">
                            <ChevronLeft size={14} className="text-primary" />
                        </div>
                    </>
                )}
                {canScrollRight && (
                    <>
                        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-background to-transparent z-20" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-background/80 border border-border shadow-lg animate-pulse pointer-events-none">
                            <ChevronRight size={14} className="text-primary" />
                        </div>
                    </>
                )}

                <div
                    ref={scrollRef}
                    className="overflow-auto no-scrollbar"
                    style={{
                        maxHeight: boardMaxHeight,
                        overscrollBehavior: 'contain',
                        cursor: isPanning ? 'grabbing' : undefined,
                    }}
                >
                <div className="relative" style={{ width: stages.length ? GUTTER_PX + stages.length * colWidth : '100%' }}>
                    {/* Stage header row — sticky top; its first cell is also sticky left,
                        so the corner survives scrolling on both axes at once. */}
                    {stages.length > 0 && (
                        <div className="sticky z-40 flex bg-background border-b border-border" style={{ top: stickyHeaderTop }}>
                            <div
                                className="sticky left-0 z-10 flex items-center justify-center border-r border-border bg-background shrink-0"
                                style={{ width: GUTTER_PX, height: HEADER_PX }}
                            >
                                <Clock size={14} className="opacity-30" />
                            </div>
                            {stages.map(stage => (
                                <div
                                    key={stage}
                                    className="flex items-center justify-center px-1.5 shrink-0 border-r border-border/30 last:border-r-0"
                                    style={{ width: colWidth, height: HEADER_PX }}
                                    title={stage}
                                >
                                    <span
                                        className="font-black uppercase tracking-[0.15em] text-primary whitespace-nowrap overflow-hidden text-ellipsis"
                                        style={{ fontSize: colWidth < 110 ? 8 : 10 }}
                                    >
                                        {stage}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {stages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                            <span className="text-[11px] font-black uppercase tracking-widest">All stages hidden</span>
                        </div>
                    ) : (
                        /* Time board — fixed gutter column + scaled stage columns */
                        <div className="flex" style={{ height: boardHeight }}>
                            <div
                                className="sticky left-0 z-30 shrink-0 border-r border-border bg-background"
                                style={{ width: GUTTER_PX }}
                            >
                                {hourMarks.map((m, i) => (
                                    i % labelStepHours === 0 && (
                                        <span
                                            key={m}
                                            className="absolute left-0 text-center text-[10px] font-black text-muted-foreground tabular-nums bg-background"
                                            style={{ width: GUTTER_PX, top: (m - dayStart) * pxPerMin - 7 }}
                                        >
                                            {formatMinutes(m)}
                                        </span>
                                    )
                                ))}
                            </div>

                            <div className="relative flex" style={{ width: stages.length * colWidth }}>
                                {hourMarks.map(m => (
                                    <div
                                        key={m}
                                        className="absolute left-0 right-0 border-t border-border/60 pointer-events-none"
                                        style={{ top: (m - dayStart) * pxPerMin }}
                                    />
                                ))}

                                {stages.map(stage => (
                                    <div
                                        key={stage}
                                        className="relative shrink-0 border-r border-border/30 last:border-r-0 h-full"
                                        style={{ width: colWidth }}
                                    >
                                        {(byStage.get(stage) ?? [])
                                            .map(item => {
                                                const startWall = wallMinutes(item.startTime);
                                                const endWall = wallMinutes(item.endTime);
                                                const top = (startWall - dayStart) * pxPerMin;
                                                const height = Math.max((endWall - startWall) * pxPerMin, 18);
                                                const { isLive, isPast } = liveState(item);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        data-no-pan
                                                        className="absolute left-0 right-0 z-10"
                                                        style={{ top, height }}
                                                    >
                                                        <ArtistCard
                                                            artist={item}
                                                            festivalId={festivalId}
                                                            isFavorite={favorites.has(item.id)}
                                                            favoriteTier={getFavoriteTier(item.id)}
                                                            isConflicting={conflicts.has(item.id)}
                                                            isLive={isLive}
                                                            isPast={isPast}
                                                            onToggleFavorite={() => handleToggleFavorite(item)}
                                                            pxHeight={height}
                                                            pxWidth={colWidth}
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
                    )}
                </div>
            </div>
            </div>
            )}

            {conflicts.size > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                    <div className="bg-destructive px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-background/20">
                        <AlertTriangle size={14} className="text-destructive-foreground" />
                        <span className="text-[10px] font-black text-destructive-foreground uppercase tracking-widest">
                            {conflicts.size} {conflicts.size === 1 ? 'ARTIST CLASHES' : 'ARTISTS CLASH'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
