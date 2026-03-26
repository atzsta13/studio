'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagCloudProps {
  artists: any[];
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
  selectedVibe: string | null;
  onVibeSelect: (vibe: string | null) => void;
}

export function TagCloud({
  artists,
  selectedGenre,
  onGenreSelect,
  selectedVibe,
  onVibeSelect,
}: TagCloudProps) {
  const genres = useMemo(() => {
    const counts: Record<string, number> = {};
    artists.forEach(a => {
      a.genres?.forEach((g: string) => {
        if (g === 'MUSIC') return;
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [artists]);

  const vibes = useMemo(() => {
    const counts: Record<string, number> = {};
    artists.forEach(a => {
      a.vibes?.forEach((v: string) => {
        counts[v] = (counts[v] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [artists]);

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold uppercase text-muted-foreground w-full mb-1">Top Genres</span>
        <Badge
          variant={selectedGenre === null ? 'default' : 'outline'}
          className="cursor-pointer border-2 font-bold"
          onClick={() => onGenreSelect(null)}
        >
          ALL
        </Badge>
        {genres.map(([genre, count]) => (
          <Badge
            key={genre}
            variant={selectedGenre === genre ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer border-2 font-bold uppercase",
              selectedGenre === genre ? "bg-[var(--acid-yellow)] text-black" : "hover:bg-white/10"
            )}
            onClick={() => onGenreSelect(genre)}
          >
            {genre} <span className="ml-1 opacity-50 text-[10px]">{count}</span>
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold uppercase text-muted-foreground w-full mb-1">Top Vibes</span>
        <Badge
          variant={selectedVibe === null ? 'default' : 'outline'}
          className="cursor-pointer border-2 font-bold"
          onClick={() => onVibeSelect(null)}
        >
          ALL
        </Badge>
        {vibes.map(([vibe, count]) => (
          <Badge
            key={vibe}
            variant={selectedVibe === vibe ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer border-2 font-bold uppercase",
              selectedVibe === vibe ? "bg-[var(--toxic-green)] text-black" : "hover:bg-white/10"
            )}
            onClick={() => onVibeSelect(vibe)}
          >
            {vibe} <span className="ml-1 opacity-50 text-[10px]">{count}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
