'use client';

import { useState, useMemo, useEffect } from 'react';
import type { LineupItem } from '@/types';
import lineup from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import { Music, Search, History, Calendar, SortAsc, Sparkles, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SpotifyConnect } from '@/components/SpotifyConnect';
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

type ViewMode = 'discover' | 'by-day' | 'by-country' | 'az' | 'spotify';

export default function DiscoverPage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [spotifyMatches, setSpotifyMatches] = useState<string[]>([]);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Group by country
  const artistsByCountry = useMemo(() => {
    const grouped: Record<string, typeof filteredArtists> = {};
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    filteredArtists.forEach(a => {
      let countryName = 'International';
      if (a.countryCode && a.countryCode !== 'Unknown') {
        try {
          const code = a.countryCode.toUpperCase() === 'UK' ? 'GB' : a.countryCode.toUpperCase();
          countryName = regionNames.of(code) || countryName;
        } catch (e) {
          countryName = a.countryCode;
        }
      }

      if (!grouped[countryName]) grouped[countryName] = [];
      grouped[countryName].push(a);
    });

    Object.keys(grouped).forEach(country => {
      grouped[country].sort((a, b) => a.artist.localeCompare(b.artist));
    });

    const sortedCountryNames = Object.keys(grouped).sort((a, b) => {
      if (a === 'International') return 1;
      if (b === 'International') return -1;
      return a.localeCompare(b);
    });

    return { grouped, sortedCountryNames };
  }, [filteredArtists]);

  const artistsAZ = useMemo(() => {
    return [...filteredArtists].sort((a, b) => a.artist.localeCompare(b.artist));
  }, [filteredArtists]);

  const artistsDiscover = useMemo(() => {
    const headliners = filteredArtists.filter(a => a.isHeadliner);
    const others = filteredArtists.filter(a => !a.isHeadliner);
    return [...headliners, ...others.sort((a, b) => a.artist.localeCompare(b.artist))];
  }, [filteredArtists]);

  const artistsSpotify = useMemo(() => {
    return filteredArtists.filter(a => spotifyMatches.includes(a.id));
  }, [filteredArtists, spotifyMatches]);

  const ArtistCard = ({ artist }: { artist: typeof filteredArtists[0] }) => {
    const isHeadliner = artist.isHeadliner;

    return (
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl shadow-xl transition-all duration-300 bg-card border-2 ${isHeadliner
          ? 'border-yellow-500/50 shadow-yellow-500/10'
          : 'border-white/5 hover:border-primary/50'
          }`}
      >
        <Link href={`/artist/${artist.id}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.artist}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <Music className="h-16 w-16 text-white/10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          {artist.day && (
            <div className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${isHeadliner
              ? 'bg-yellow-500 text-black border-yellow-400'
              : 'bg-black/60 text-white/90 border-white/10'}`}>
              {artist.day}
            </div>
          )}

          {isHeadliner && (
            <div className="absolute top-3 left-3 rounded-full bg-yellow-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-lg animate-pulse">
              HEADLINER
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              {isMounted && (
                <span className="text-xl" suppressHydrationWarning>
                  {getFlagEmoji(artist.countryCode)}
                </span>
              )}
              <h3 className={`font-black text-lg leading-tight drop-shadow-2xl line-clamp-1 uppercase tracking-tighter ${isHeadliner ? 'text-yellow-400' : 'text-white'}`}>
                {artist.artist}
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {artist.genres?.filter(g => g !== 'MUSIC').slice(0, 3).map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border bg-white/10 backdrop-blur-md text-white/80 border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <div className="flex flex-col p-4 bg-zinc-900/50 backdrop-blur-sm gap-4">
          <div className="min-h-[1.2rem]">
            {artist.vibes && artist.vibes.length > 0 && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                {artist.vibes.slice(0, 3).join(' // ')}
              </p>
            )}
          </div>
          
          <Button 
            asChild 
            size="lg" 
            variant="default"
            className={`w-full font-black text-xs uppercase tracking-[0.2em] rounded-xl h-12 shadow-2xl transition-all duration-300 group-hover:scale-[1.02] active:scale-95 ${
              isHeadliner 
                ? "bg-yellow-500 hover:bg-yellow-400 text-black border-none" 
                : "bg-primary hover:bg-primary/90 text-white border-none shadow-primary/20"
            }`}
          >
            <Link href={`/artist/${artist.id}`}>
              Explore Artist
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-primary/10 shadow-2xl shadow-primary/20 ring-1 ring-primary/20">
          <Music className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-black tracking-tighter text-foreground sm:text-6xl uppercase italic">
          Music <span className="text-primary">Finder</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-muted-foreground leading-relaxed">
          The ultimate scouting tool for the Island of Freedom.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="inline-flex rounded-2xl bg-zinc-900/50 p-1.5 border border-white/5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setActiveYear('2026')}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-black tracking-widest transition-all ${activeYear === '2026'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-500 hover:text-white'
                }`}
            >
              2026
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-black tracking-widest transition-all ${activeYear === '2025'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-500 hover:text-white'
                }`}
            >
              <History className="h-4 w-4" />
              2025
            </button>
          </div>

          <div className="flex items-center relative z-10">
            <SpotifyConnect onMatchesFound={(ids) => {
              setSpotifyMatches(ids);
              setIsSpotifyConnected(true);
              if (ids.length > 0) {
                setViewMode('spotify');
              }
            }} />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 -mx-4 space-y-4 bg-background/95 px-4 pb-6 pt-4 backdrop-blur-md md:top-16 border-b border-white/5">
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-center">
          <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-white/5 shadow-inner shrink-0 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setViewMode('discover')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'discover' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Discover
            </button>
            <button
              onClick={() => setViewMode('az')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'az' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <SortAsc className="h-3.5 w-3.5" />
              A-Z
            </button>
            <button
              onClick={() => setViewMode('by-day')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'by-day' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              By Day
            </button>
            <button
              onClick={() => setViewMode('by-country')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'by-country' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Country
            </button>
            {isSpotifyConnected && (
              <button
                onClick={() => setViewMode('spotify')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'spotify' ? 'bg-[#1DB954] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <div className="h-3.5 w-3.5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.48-.6 13.26 1.74.42.24.6.84.48 1.08zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                Matches
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto shrink-0">
            <Select value={selectedVibe || 'all'} onValueChange={v => setSelectedVibe(v === 'all' ? null : v)}>
              <SelectTrigger className="h-10 w-full sm:w-[160px] text-xs font-bold uppercase tracking-widest bg-zinc-900 border-white/5 rounded-xl">
                <SelectValue placeholder="ANY MOOD" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">ANY MOOD</SelectItem>
                {allVibeSet.map(vibe => (
                  <SelectItem key={vibe} value={vibe}>{vibe.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGenre || 'all'} onValueChange={v => setSelectedGenre(v === 'all' ? null : v)}>
              <SelectTrigger className="h-10 w-full sm:w-[160px] text-xs font-bold uppercase tracking-widest bg-zinc-900 border-white/5 rounded-xl">
                <SelectValue placeholder="ANY GENRE" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">ANY GENRE</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre.toUpperCase()}</SelectItem>
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
                className="h-10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {viewMode === 'by-day' && (
          <div className="space-y-12">
            {DAY_ORDER.map(day => {
              const dayArtists = artistsByDay.grouped[day];
              if (!dayArtists || dayArtists.length === 0) return null;

              const headliners = dayArtists.filter(a => a.isHeadliner);
              const others = dayArtists.filter(a => !a.isHeadliner);

              return (
                <section key={day}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">{day}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{dayArtists.length} acts</span>
                  </div>

                  {headliners.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {headliners.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </div>
                  )}

                  {others.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {others.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {artistsByDay.noDay.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-muted-foreground">Day TBD</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{artistsByDay.noDay.length} acts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {artistsByDay.noDay.map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {viewMode === 'by-country' && (
          <div className="space-y-12">
            {artistsByCountry.sortedCountryNames.map(country => {
              const countryArtists = artistsByCountry.grouped[country];
              const firstArtist = countryArtists[0];

              return (
                <section key={country}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
                      {isMounted && (
                        <span suppressHydrationWarning>
                          {getFlagEmoji(firstArtist.countryCode)}
                        </span>
                      )}
                      {country}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{countryArtists.length} acts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {countryArtists.map(artist => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {viewMode === 'az' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artistsAZ.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}

        {viewMode === 'discover' && (
          <div className="space-y-12">
            {artistsDiscover.filter(a => a.isHeadliner).length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Headliners</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artistsDiscover.filter(a => a.isHeadliner).map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-4 mb-6">
                <Music className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Full Lineup</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {artistsDiscover.filter(a => !a.isHeadliner).map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          </div>
        )}

        {viewMode === 'spotify' && (
          <div className="space-y-10">
            <div className="flex items-center gap-4 mb-8 bg-[#1DB954]/5 p-6 rounded-[2rem] border border-[#1DB954]/20">
              <div className="bg-[#1DB954] p-4 rounded-3xl text-white shadow-2xl shadow-[#1DB954]/40">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.48-.6 13.26 1.74.42.24.6.84.48 1.08zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Your Sziget Match</h2>
                <p className="text-sm font-bold text-[#1DB954] uppercase tracking-widest mt-1">Found {artistsSpotify.length} artists in your library</p>
              </div>
            </div>

            {(() => {
              const headliners = artistsSpotify.filter(a => a.isHeadliner);
              const others = artistsSpotify.filter(a => !a.isHeadliner);

              if (artistsSpotify.length === 0) {
                return (
                  <div className="text-center py-24 bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-white/5 mx-auto max-w-lg">
                    <div className="mx-auto bg-zinc-800 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                      <Music className="h-10 w-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic text-white mb-3">No matches found</h3>
                    <p className="text-zinc-500 font-medium px-8 leading-relaxed">
                      We checked your top tracks but couldn't find any Sziget 2026 artists yet. Keep listening and sync again later!
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-12">
                  {headliners.length > 0 && (
                    <section>
                      <div className="flex items-center gap-4 mb-6">
                        <Sparkles className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Matched Headliners</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {headliners.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </section>
                  )}

                  {others.length > 0 && (
                    <section>
                      <div className="flex items-center gap-4 mb-6">
                        <Music className="h-6 w-6 text-[#1DB954]" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Library Artists</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#1DB954]/30 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {others.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {filteredArtists.length === 0 && (
        <div className="py-32 text-center bg-zinc-900/20 rounded-[3rem] border border-white/5">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800">
            <Search className="h-12 w-12 text-zinc-600" />
          </div>
          <h3 className="text-3xl font-black uppercase italic text-foreground">Dead Silence</h3>
          <p className="mt-4 text-zinc-500 font-medium">
            Try loosening your filters to discover something new.
          </p>
          <Button
            variant="outline"
            className="mt-8 rounded-xl px-8 h-12 font-black uppercase tracking-widest border-white/10 hover:bg-white/5"
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
