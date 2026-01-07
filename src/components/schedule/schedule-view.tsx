'use client';

import { useMemo, useState } from 'react';
import type { LineupItem } from '@/types';
import { useFavorites } from '@/hooks/use-favorites';
import ArtistCard from './artist-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from 'date-fns';

const MIN_TIME = 17; // 5 PM
const MAX_TIME = 24; // 12 AM

export default function ScheduleView({ lineup }: { lineup: LineupItem[] }) {
  const { favorites, toggleFavorite, conflicts } = useFavorites(lineup);

  const { days, stages, timeSlots } = useMemo(() => {
    const uniqueDays = [...new Set(lineup.map(item => item.day))].sort((a,b) => new Date(lineup.find(l => l.day === a)!.startTime).getTime() - new Date(lineup.find(l => l.day === b)!.startTime).getTime());
    const uniqueStages = [...new Set(lineup.map(item => item.stage))];
    const slots = Array.from({ length: (MAX_TIME - MIN_TIME) * 2 }, (_, i) => {
      const hour = MIN_TIME + Math.floor(i / 2);
      const minute = (i % 2) * 30;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });
    return { days: uniqueDays, stages: uniqueStages, timeSlots: slots };
  }, [lineup]);

  const getGridRow = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startMinutes = (start.getUTCHours() - MIN_TIME) * 60 + start.getUTCMinutes();
    const endMinutes = (end.getUTCHours() - MIN_TIME) * 60 + end.getUTCMinutes();

    const startRow = Math.floor(startMinutes / 30) + 2;
    const endRow = Math.floor(endMinutes / 30) + 2;

    return { gridRowStart: startRow, gridRowEnd: endRow };
  };

  const [activeDay, setActiveDay] = useState(days[0]);

  const dailyLineup = lineup.filter(item => item.day === activeDay);

  return (
    <div className="container px-0 md:px-4">
      <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
        <div className="flex justify-center p-2">
            <TabsList className="grid w-full max-w-lg grid-cols-2">
            {days.map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
            ))}
            </TabsList>
        </div>
        
        {days.map(day => (
          <TabsContent key={day} value={day} className="mt-0">
            <div className="relative overflow-x-auto">
              <div
                className="grid min-w-[800px] gap-x-2 gap-y-1 p-4"
                style={{
                  gridTemplateColumns: `60px repeat(${stages.length}, 1fr)`,
                  gridTemplateRows: `auto repeat(${(MAX_TIME - MIN_TIME) * 2}, 30px)`,
                }}
              >
                {/* Stage Headers */}
                {stages.map((stage, index) => (
                  <div
                    key={stage}
                    className="sticky top-32 md:top-44 z-20 text-center font-bold text-foreground"
                    style={{ gridColumn: index + 2 }}
                  >
                    {stage}
                  </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="relative text-right text-xs text-muted-foreground pr-2"
                    style={{ gridRow: index + 2, gridColumn: 1 }}
                  >
                    <span className="relative -top-2">{time}</span>
                    <div className="absolute right-0 top-0 h-px w-screen bg-border/20"></div>
                  </div>
                ))}

                {/* Artist Cards */}
                {lineup.filter(item => item.day === day).map(item => (
                  <div
                    key={item.id}
                    className="relative"
                    style={{
                      ...getGridRow(item.startTime, item.endTime),
                      gridColumn: stages.indexOf(item.stage) + 2,
                    }}
                  >
                    <ArtistCard
                      artist={item}
                      isFavorite={favorites.has(item.id)}
                      isConflicting={conflicts.has(item.id)}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
