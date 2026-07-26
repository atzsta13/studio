import type { ScheduledSlot } from '@/types';
import ArtistCard from './artist-card';

export interface TimetableListGroup {
    time: string;
    items: ScheduledSlot[];
}

interface TimetableListProps {
    groups: TimetableListGroup[];
    festivalId: string;
    maxHeight: string;
    isFavorite: (id: string) => boolean;
    favoriteTier: (id: string) => 'must_see' | 'interested' | null;
    isConflicting: (id: string) => boolean;
    liveState: (item: ScheduledSlot) => { isLive: boolean; isPast: boolean };
    onToggleFavorite: (item: ScheduledSlot) => void;
}

/**
 * The day as a running order: one time-ordered column, sets grouped under their
 * start time and labelled with their stage. For people who read a festival day
 * as a list rather than a map — and the zoom controls do not apply here.
 */
export default function TimetableList({
    groups,
    festivalId,
    maxHeight,
    isFavorite,
    favoriteTier,
    isConflicting,
    liveState,
    onToggleFavorite,
}: TimetableListProps) {
    return (
        <div className="flex flex-col gap-6 px-4 py-4 overflow-y-auto no-scrollbar" style={{ maxHeight }}>
            {groups.map(group => (
                <div key={group.time} className="flex gap-4 items-start">
                    <div className="w-12 shrink-0 sticky top-0 py-1 bg-background/90 z-10">
                        <span className="text-[12px] font-black text-foreground/80 tabular-nums">
                            {group.time}
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        {group.items.map(item => {
                            const { isLive, isPast } = liveState(item);
                            return (
                                <div key={item.id} className="flex flex-col gap-1 w-full">
                                    <div className="text-[8px] font-black tracking-widest text-primary/80 uppercase">
                                        {item.stage}
                                    </div>
                                    <ArtistCard
                                        artist={item}
                                        festivalId={festivalId}
                                        isFavorite={isFavorite(item.id)}
                                        favoriteTier={favoriteTier(item.id)}
                                        isConflicting={isConflicting(item.id)}
                                        isLive={isLive}
                                        isPast={isPast}
                                        onToggleFavorite={() => onToggleFavorite(item)}
                                        positionRelative
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
