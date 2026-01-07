'use client';

import { useMemo, useState } from 'react';
import type { LineupItem } from '@/types';
import { useFavorites } from '@/hooks/use-favorites';
import ArtistCard from './artist-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

const MIN_TIME = 12; // 12 PM
const MAX_TIME = 29; // 5 AM (of the next day)

export default function ScheduleView({ lineup }: { lineup: LineupItem[] }) {
  const { favorites, toggleFavorite, conflicts } = useFavorites(lineup);

  const { days, stages, timeSlots } = useMemo(() => {
    const uniqueDays = [...new Set(lineup.map(item => item.day))].sort((a, b) => new Date(lineup.find(l => l.day === a)!.startTime).getTime() - new Date(lineup.find(l => l.day === b)!.startTime).getTime());
    const uniqueStages = [...new Set(lineup.map(item => item.stage))];
    const slots = Array.from({ length: (MAX_TIME - MIN_TIME) * 2 }, (_, i) => {
      const totalHour = MIN_TIME + Math.floor(i / 2);
      const displayHour = totalHour % 24;
      const minute = (i % 2) * 30;
      return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });
    return { days: uniqueDays, stages: uniqueStages, timeSlots: slots };
  }, [lineup]);

  const getGridRow = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    let startHours = start.getUTCHours();
    if (startHours < MIN_TIME) startHours += 24;

    let endHours = end.getUTCHours();
    if (endHours < MIN_TIME) endHours += 24;

    const startMinutes = (startHours - MIN_TIME) * 60 + start.getUTCMinutes();
    const endMinutes = (endHours - MIN_TIME) * 60 + end.getUTCMinutes();

    const startRow = Math.floor(startMinutes / 30) + 2;
    const endRow = Math.floor(endMinutes / 30) + 2;

    return { gridRowStart: startRow, gridRowEnd: endRow };
  };

  const [activeDay, setActiveDay] = useState(days[0]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    lineup.forEach(item => item.genres?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, [lineup]);

  const filteredLineup = useMemo(() => {
    return lineup.filter(item => {
      const matchesSearch = item.artist.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = !selectedGenre || item.genres?.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }, [lineup, search, selectedGenre]);

  const dailyLineup = filteredLineup.filter(item => item.day === activeDay);

  return (
    <div className="container px-0 md:px-4">
      <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
        <div className="flex flex-col gap-4 p-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full max-w-6xl mx-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search artists..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex justify-center flex-1">
              <TabsList className="grid w-full max-w-lg grid-cols-5">
                {days.map(day => (
                  <TabsTrigger key={day} value={day} className="text-xs sm:text-sm">
                    {day.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex gap-1">
                <Badge 
                  variant={!selectedGenre ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedGenre(null)}
                >
                  All
                </Badge>
                {allGenres.slice(0, 5).map(genre => (
                  <Badge 
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
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
                {dailyLineup.filter(item => item.day === day).map(item => (
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
