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

type ViewMode = 'discover' | 'az' | 'by-day' | 'by-country' | 'spotify';

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
      grouped[country].sort((a, b) => {
        if (a.isHeadliner && !b.isHeadliner) return -1;
        if (!a.isHeadliner && b.isHeadliner) return 1;
        return a.artist.localeCompare(b.artist);
      });
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
        className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 bg-zinc-900 border-2 ${isHeadliner
          ? 'border-yellow-500/50 shadow-yellow-500/20'
          : 'border-white/5 hover:border-primary/50'
          }`}
      >
        <Link href={`/artist/${artist.id}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-zinc-800">
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

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

          {artist.day && (
            <div className={`absolute top-4 right-4 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl ${isHeadliner
              ? 'bg-yellow-500 text-black border-yellow-400'
              : 'bg-black/60 text-white/90 border-white/10'}`}>
              {artist.day}
            </div>
          )}

          {isHeadliner && (
            <div className="absolute top-4 left-4 rounded-full bg-yellow-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg animate-pulse">
              HEADLINER
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-2">
              {isMounted && (
                <span className="text-2xl drop-shadow-lg" suppressHydrationWarning>
                  {getFlagEmoji(artist.countryCode)}
                </span>
              )}
              <h3 className={`font-black text-2xl leading-tight drop-shadow-2xl line-clamp-1 uppercase tracking-tighter ${isHeadliner ? 'text-yellow-400' : 'text-white'}`}>
                {artist.artist}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {artist.genres?.filter(g => g !== 'MUSIC').slice(0, 3).map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border bg-white/5 backdrop-blur-md text-white/70 border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <div className="flex flex-col p-6 bg-zinc-950/80 backdrop-blur-md gap-6 border-t border-white/5">
          <div className="min-h-[1.2rem]">
            {artist.vibes && artist.vibes.length > 0 && (
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] truncate">
                {artist.vibes.slice(0, 3).join(' • ')}
              </p>
            )}
          </div>
          
          <Button 
            asChild 
            size="lg" 
            variant="default"
            className={`w-full font-black text-sm uppercase tracking-[0.25em] rounded-2xl h-16 shadow-2xl transition-all duration-300 group-hover:scale-[1.03] active:scale-95 border-none ${
              isHeadliner 
                ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20" 
                : "bg-primary hover:bg-primary/90 text-white shadow-primary/30"
            }`}
          >
            <Link href={`/artist/${artist.id}`}>
              Explore Artist
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="mb-16 text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[3rem] bg-primary/10 shadow-2xl shadow-primary/20 ring-1 ring-primary/20">
          <Music className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-5xl font-black tracking-tighter text-white sm:text-7xl uppercase italic">
          Music <span className="text-primary">Finder</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-zinc-400 leading-relaxed">
          The ultimate scouting tool for the Island of Freedom. Find your new favorite obsession.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-8">
          <div className="inline-flex rounded-2xl bg-zinc-900/50 p-2 border border-white/5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setActiveYear('2026')}
              className={`flex items-center gap-3 rounded-xl px-8 py-3 text-sm font-black tracking-widest transition-all ${activeYear === '2026'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-zinc-500 hover:text-white'
                }`}
            >
              2026
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`flex items-center gap-3 rounded-xl px-8 py-3 text-sm font-black tracking-widest transition-all ${activeYear === '2025'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
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

      <div className="sticky top-0 z-30 -mx-4 space-y-6 bg-background/95 px-4 pb-8 pt-6 backdrop-blur-xl md:top-16 border-b border-white/5">
        <div className="flex flex-col gap-6 sm:flex-row justify-between items-center">
          <div className="inline-flex rounded-2xl bg-zinc-950 p-1.5 border border-white/5 shadow-inner shrink-0 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setViewMode('discover')}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'discover' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Sparkles className="h-4 w-4" />
              Discover
            </button>
            <button
              onClick={() => setViewMode('az')}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'az' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <SortAsc className="h-4 w-4" />
              A-Z
            </button>
            <button
              onClick={() => setViewMode('by-day')}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'by-day' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Calendar className="h-4 w-4" />
              By Day
            </button>
            <button
              onClick={() => setViewMode('by-country')}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'by-country' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Globe className="h-4 w-4" />
              Country
            </button>
            {isSpotifyConnected && (
              <button
                onClick={() => setViewMode('spotify')}
                className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'spotify' ? 'bg-[#1DB954] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.48-.6 13.26 1.74.42.24.6.84.48 1.08zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                Matches
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto shrink-0">
            <Select value={selectedVibe || 'all'} onValueChange={v => setSelectedVibe(v === 'all' ? null : v)}>
              <SelectTrigger className="h-12 w-full sm:w-[180px] text-[11px] font-black uppercase tracking-widest bg-zinc-950 border-white/5 rounded-xl shadow-inner">
                <SelectValue placeholder="ANY MOOD" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="all">ANY MOOD</SelectItem>
                {allVibeSet.map(vibe => (
                  <SelectItem key={vibe} value={vibe}>{vibe.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGenre || 'all'} onValueChange={v => setSelectedGenre(v === 'all' ? null : v)}>
              <SelectTrigger className="h-12 w-full sm:w-[180px] text-[11px] font-black uppercase tracking-widest bg-zinc-950 border-white/5 rounded-xl shadow-inner">
                <SelectValue placeholder="ANY GENRE" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
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
                className="h-12 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl px-6"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        {viewMode === 'by-day' && (
          <div className="space-y-20">
            {DAY_ORDER.map(day => {
              const dayArtists = artistsByDay.grouped[day];
              if (!dayArtists || dayArtists.length === 0) return null;

              const headliners = dayArtists.filter(a => a.isHeadliner);
              const others = dayArtists.filter(a => !a.isHeadliner);

              return (
                <section key={day}>
                  <div className="flex items-center gap-6 mb-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{day}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">{dayArtists.length} acts</span>
                  </div>

                  {headliners.length > 0 && (
                    <div className="mb-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {headliners.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </div>
                  )}

                  {others.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-500">Day TBD</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">{artistsByDay.noDay.length} acts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {artistsByDay.noDay.map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {viewMode === 'by-country' && (
          <div className="space-y-20">
            {artistsByCountry.sortedCountryNames.map(country => {
              const countryArtists = artistsByCountry.grouped[country];
              const firstArtist = countryArtists[0];

              return (
                <section key={country}>
                  <div className="flex items-center gap-6 mb-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                      {isMounted && (
                        <span className="drop-shadow-lg" suppressHydrationWarning>
                          {getFlagEmoji(firstArtist.countryCode)}
                        </span>
                      )}
                      {country}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">{countryArtists.length} acts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {artistsAZ.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}

        {viewMode === 'discover' && (
          <div className="space-y-20">
            {artistsDiscover.filter(a => a.isHeadliner).length > 0 && (
              <section>
                <div className="flex items-center gap-6 mb-10">
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Headliners</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {artistsDiscover.filter(a => a.isHeadliner).map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-6 mb-10">
                <Music className="h-8 w-8 text-primary" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Full Lineup</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {artistsDiscover.filter(a => !a.isHeadliner).map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          </div>
        )}

        {viewMode === 'spotify' && (
          <div className="space-y-12">
            <div className="flex items-center gap-6 mb-12 bg-[#1DB954]/5 p-8 rounded-[3rem] border border-[#1DB954]/20">
              <div className="bg-[#1DB954] p-5 rounded-[2rem] text-white shadow-2xl shadow-[#1DB954]/40">
                <svg viewBox="0 0 24 24" className="h-10 w-10 fill-current">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.48-.6 13.26 1.74.42.24.6.84.48 1.08zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Your Sziget Match</h2>
                <p className="text-sm font-black text-[#1DB954] uppercase tracking-[0.3em] mt-2">Found {artistsSpotify.length} artists in your library</p>
              </div>
            </div>

            {(() => {
              const headliners = artistsSpotify.filter(a => a.isHeadliner);
              const others = artistsSpotify.filter(a => !a.isHeadliner);

              if (artistsSpotify.length === 0) {
                return (
                  <div className="text-center py-32 bg-zinc-900/30 rounded-[4rem] border-2 border-dashed border-white/5 mx-auto max-w-2xl">
                    <div className="mx-auto bg-zinc-800 rounded-full w-24 h-24 flex items-center justify-center mb-8">
                      <Music className="h-12 w-12 text-white/20" />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic text-white mb-4">No matches found</h3>
                    <p className="text-zinc-500 text-lg font-medium px-12 leading-relaxed">
                      We checked your top tracks but couldn't find any Sziget 2026 artists yet. Keep listening and sync again later!
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-20">
                  {headliners.length > 0 && (
                    <section>
                      <div className="flex items-center gap-6 mb-10">
                        <Sparkles className="h-8 w-8 text-yellow-500" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Matched Headliners</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {headliners.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </section>
                  )}

                  {others.length > 0 && (
                    <section>
                      <div className="flex items-center gap-6 mb-10">
                        <Music className="h-8 w-8 text-[#1DB954]" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Library Artists</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#1DB954]/30 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
        <div className="py-40 text-center bg-zinc-900/20 rounded-[4rem] border border-white/5">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-zinc-800 shadow-inner">
            <Search className="h-16 w-16 text-zinc-600" />
          </div>
          <h3 className="text-4xl font-black uppercase italic text-white">Dead Silence</h3>
          <p className="mt-6 text-zinc-500 text-lg font-medium">
            Try loosening your filters to discover something new on the island.
          </p>
          <Button
            variant="outline"
            className="mt-12 rounded-2xl px-12 h-14 font-black uppercase tracking-widest border-white/10 hover:bg-white/5 shadow-2xl"
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