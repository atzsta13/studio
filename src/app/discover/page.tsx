'use client';

import { useState, useMemo } from 'react';
import type { LineupItem } from '@/types';
import lineup from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import { Music, Search, History, Calendar, SortAsc, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const allArtists2026 = (lineup as any[]).map(a => ({
  ...a,
  vibes: a.vibes || [],
})) as (LineupItem & { vibes: string[]; isHeadliner?: boolean })[];

const allArtists2025 = (lineup2025 as any[]).map(a => ({
  ...a,
  vibes: a.vibes || [],
})) as (LineupItem & { vibes: string[]; isHeadliner?: boolean })[];

const getFlagEmoji = (countryCode: string | undefined) => {
  if (!countryCode || countryCode === 'Unknown') return '';
  const trimmedCode = countryCode.trim().toUpperCase();
  const code = trimmedCode === 'UK' ? 'GB' : trimmedCode;
  try {
    const codePoints = code
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '';
  }
};

const DAY_ORDER = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type ViewMode = 'discover' | 'by-day' | 'az';

export default function DiscoverPage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('by-day');

  const allArtists = useMemo(() => {
    return activeYear === '2026' ? allArtists2026 : allArtists2025;
  }, [activeYear]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    allArtists.forEach(item => item.genres?.forEach(g => {
      if (g !== 'MUSIC') genres.add(g);
    }));
    return Array.from(genres).sort();
  }, [allArtists]);

  const allVibeSet = useMemo(() => {
    const vibes = new Set<string>();
    allArtists.forEach(item => item.vibes?.forEach(v => vibes.add(v)));
    return Array.from(vibes).sort();
  }, [allArtists]);

  const filteredArtists = useMemo(() => {
    return allArtists.filter(artist => {
      const matchesGenre =
        !selectedGenre || artist.genres?.includes(selectedGenre);
      const matchesVibe =
        !selectedVibe || artist.vibes?.includes(selectedVibe);
      return matchesGenre && matchesVibe;
    });
  }, [allArtists, selectedGenre, selectedVibe]);

  // Group by day with headliners first
  const artistsByDay = useMemo(() => {
    const grouped: Record<string, typeof filteredArtists> = {};
    const noDay: typeof filteredArtists = [];

    filteredArtists.forEach(a => {
      if (a.day) {
        if (!grouped[a.day]) grouped[a.day] = [];
        grouped[a.day].push(a);
      } else {
        noDay.push(a);
      }
    });

    // Sort each day: headliners first, then alphabetically
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        if (a.isHeadliner && !b.isHeadliner) return -1;
        if (!a.isHeadliner && b.isHeadliner) return 1;
        return a.artist.localeCompare(b.artist);
      });
    });

    return { grouped, noDay: noDay.sort((a, b) => a.artist.localeCompare(b.artist)) };
  }, [filteredArtists]);

  // A-Z sorted
  const artistsAZ = useMemo(() => {
    return [...filteredArtists].sort((a, b) => a.artist.localeCompare(b.artist));
  }, [filteredArtists]);

  // Discover mode (headliners first, then others)
  const artistsDiscover = useMemo(() => {
    const headliners = filteredArtists.filter(a => a.isHeadliner);
    const others = filteredArtists.filter(a => !a.isHeadliner);
    return [...headliners, ...others.sort((a, b) => a.artist.localeCompare(b.artist))];
  }, [filteredArtists]);

  const ArtistCard = ({ artist }: { artist: typeof filteredArtists[0] }) => {
    const isHeadliner = artist.isHeadliner;

    return (
      <Link
        href={`/artist/${artist.id}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card ${isHeadliner
          ? 'border-2 border-yellow-500 hover:shadow-yellow-500/30 hover:shadow-xl'
          : 'border border-border/50 hover:border-primary/30 hover:shadow-primary/10 hover:shadow-xl'
          }`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.artist}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Music className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Day Badge */}
          {artist.day && (
            <div className={`absolute top-2 right-2 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${isHeadliner
              ? 'bg-yellow-500 text-black border-yellow-400'
              : 'bg-black/60 text-white/90 border-white/10'}`}>
              {artist.day}
            </div>
          )}

          {/* Headliner Badge - Explicit Visual Marker */}
          {isHeadliner && (
            <div className="absolute top-2 left-2 rounded-full bg-yellow-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black shadow-lg">
              Headliner
            </div>
          )}

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Artist Name */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-lg" suppressHydrationWarning>{getFlagEmoji(artist.countryCode)}</span>
              <h3 className={`font-bold text-sm leading-tight drop-shadow-lg line-clamp-1 ${isHeadliner ? 'text-yellow-400' : 'text-white'}`}>
                {artist.artist}
              </h3>
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-1">
              {artist.genres?.filter(g => g !== 'MUSIC').slice(0, 2).map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide border shadow-sm bg-white/20 backdrop-blur-sm text-white border-white/20"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between px-3 py-2 bg-card">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {artist.vibes && artist.vibes.length > 0 && (
              <p className="text-[10px] text-muted-foreground truncate">
                {artist.vibes.slice(0, 2).join(' • ')}
              </p>
            )}
          </div>

          <div className={`flex-shrink-0 ml-2 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${isHeadliner
            ? 'bg-yellow-500/20 group-hover:bg-yellow-500 group-hover:scale-110'
            : 'bg-primary/10 group-hover:bg-primary group-hover:scale-110'
            }`}>
            <svg
              className={`h-3 w-3 transition-colors ${isHeadliner ? 'text-yellow-500 group-hover:text-black' : 'text-primary group-hover:text-primary-foreground'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Music className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Music Finder
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Discover your next favorite artists by mood, genre, and vibe.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-xl bg-muted/50 p-1 border border-border/50 shadow-inner">
            <button
              onClick={() => setActiveYear('2026')}
              className={`flex items-center gap-2 rounded-lg px-5 py-1.5 text-sm font-bold transition-all ${activeYear === '2026'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              2026
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`flex items-center gap-2 rounded-lg px-5 py-1.5 text-sm font-bold transition-all ${activeYear === '2025'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <History className="h-3.5 w-3.5" />
              2025
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 -mx-4 space-y-3 bg-background/95 px-4 pb-4 pt-3 backdrop-blur-md md:top-16 border-b shadow-sm">
        {/* View Mode and Filters Row */}
        <div className="flex flex-col gap-3 sm:flex-row justify-between items-center">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg bg-muted p-0.5 border shadow-sm">
            <button
              onClick={() => setViewMode('by-day')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'by-day' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              By Day
            </button>
            <button
              onClick={() => setViewMode('az')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'az' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <SortAsc className="h-3.5 w-3.5" />
              A-Z
            </button>
            <button
              onClick={() => setViewMode('discover')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'discover' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Discover
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedVibe || 'all'} onValueChange={v => setSelectedVibe(v === 'all' ? null : v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Any Mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Mood</SelectItem>
                {allVibeSet.map(vibe => (
                  <SelectItem key={vibe} value={vibe}>{vibe}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGenre || 'all'} onValueChange={v => setSelectedGenre(v === 'all' ? null : v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Any Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Genre</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedGenre || selectedVibe) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedGenre(null);
                  setSelectedVibe(null);
                }}
                className="h-8 text-xs text-primary hover:text-primary/80"
              >
                Clear filters
              </Button>
            )}

            <span className="ml-auto text-xs text-muted-foreground self-center">
              {filteredArtists.length} artists
            </span>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'by-day' && (
        <div className="mt-6 space-y-8">
          {DAY_ORDER.map(day => {
            const dayArtists = artistsByDay.grouped[day];
            if (!dayArtists || dayArtists.length === 0) return null;

            const headliners = dayArtists.filter(a => a.isHeadliner);
            const others = dayArtists.filter(a => !a.isHeadliner);

            return (
              <section key={day}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-foreground">{day}</h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{dayArtists.length} acts</span>
                </div>

                {/* Headliners Row */}
                {headliners.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {headliners.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Artists Grid */}
                {others.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
                    {others.map(artist => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {/* No Day Yet */}
          {artistsByDay.noDay.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-muted-foreground">Day TBD</h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{artistsByDay.noDay.length} acts</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
                {artistsByDay.noDay.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {viewMode === 'az' && (
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
            {artistsAZ.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      )}

      {viewMode === 'discover' && (
        <div className="mt-6 space-y-8">
          {/* Headliners Section */}
          {artistsDiscover.filter(a => a.isHeadliner).length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-foreground">Headliners</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {artistsDiscover.filter(a => a.isHeadliner).map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* All Others */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Full Lineup</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
              {artistsDiscover.filter(a => !a.isHeadliner).map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Empty State */}
      {filteredArtists.length === 0 && (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">No artists found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your filters.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedVibe(null);
            }}
          >
            Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}
