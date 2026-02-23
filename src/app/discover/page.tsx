'use client';

import { useState, useMemo, useEffect } from 'react';
import type { LineupItem } from '@/types';
import lineup from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import { Music, Search, Calendar, SortAsc, Sparkles, Globe, Wand2, Loader2, ChevronRight } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { recommendArtists, type RecommendOutput } from '@/ai/flows/recommend-artists-flow';

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

type ViewMode = 'discover' | 'az' | 'by-day' | 'by-country' | 'spotify' | 'ai';

export default function DiscoverPage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [spotifyMatches, setSpotifyMatches] = useState<string[]>([]);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // AI Scout State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<RecommendOutput | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

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
    let base = [...allArtists];

    if (viewMode === 'ai' && aiResult) {
      const ids = aiResult.recommendations.map(r => r.artistId);
      base = base.filter(a => ids.includes(a.id));
    }

    if (viewMode === 'spotify') {
      base = base.filter(a => spotifyMatches.includes(a.id));
    }

    if (viewMode === 'az') {
      base.sort((a, b) => a.artist.localeCompare(b.artist));
    }

    return base.filter(artist => {
      const matchesGenre =
        !selectedGenre || artist.genres?.includes(selectedGenre);
      const matchesVibe =
        !selectedVibe || artist.vibes?.includes(selectedVibe);
      return matchesGenre && matchesVibe;
    });
  }, [allArtists, selectedGenre, selectedVibe, viewMode, aiResult, spotifyMatches]);

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

  const handleAiScout = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await recommendArtists({ prompt: aiPrompt });
      setAiResult(result);
      setViewMode('ai');
      setIsAiDialogOpen(false);
    } catch (error) {
      console.error('AI Scout failed', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const ArtistCard = ({ artist }: { artist: typeof filteredArtists[0] }) => {
    const isHeadliner = artist.isHeadliner;
    const aiReason = aiResult?.recommendations.find(r => r.artistId === artist.id)?.reason;

    return (
      <Link 
        href={`/artist/${artist.id}`}
        className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] transition-all duration-500 bg-card border ${
          isHeadliner
            ? 'border-primary/40 shadow-2xl shadow-primary/5'
            : 'border-border/50 hover:border-primary/40 hover:shadow-2xl'
        }`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.artist}
              className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Music className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />

          {artist.day && (
            <div className={`absolute top-5 right-5 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-xl z-10 ${
              isHeadliner
                ? 'bg-primary text-primary-foreground border-primary/20'
                : 'bg-black/60 text-white border-white/10'
            }`}>
              {artist.day}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="flex items-center gap-2 mb-2">
              {isMounted && (
                <span className="text-xl drop-shadow-lg" suppressHydrationWarning>
                  {getFlagEmoji(artist.countryCode)}
                </span>
              )}
              <h3 className={`font-black text-2xl sm:text-3xl leading-[0.9] uppercase tracking-tighter transition-colors text-white ${
                isHeadliner ? 'text-primary group-hover:text-white' : 'group-hover:text-primary'
              }`}>
                {artist.artist}
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {artist.genres?.filter(g => g !== 'MUSIC').slice(0, 2).map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] border bg-white/10 backdrop-blur-md text-white border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-full shadow-2xl">
              <ChevronRight className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {aiReason ? (
          <div className="px-6 py-5 bg-primary/5 border-t border-primary/20">
            <p className="text-[11px] font-bold text-primary leading-tight italic">
              "{aiReason}"
            </p>
          </div>
        ) : artist.vibes && artist.vibes.length > 0 && (
          <div className="px-6 py-4 bg-card backdrop-blur-sm border-t border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate opacity-60">
              {artist.vibes.slice(0, 3).join(' • ')}
            </p>
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="mb-20 text-center">
        <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 shadow-2xl shadow-primary/10 ring-1 ring-primary/20">
          <Music className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-6xl font-black tracking-tighter text-foreground sm:text-8xl uppercase italic leading-[0.8]">
          Music <span className="text-primary">Finder</span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-lg font-medium text-muted-foreground leading-relaxed opacity-80">
          Personalized discovery for the Island of Freedom.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="inline-flex rounded-2xl bg-muted/50 p-1.5 border border-border shadow-inner backdrop-blur-xl">
            <button
              onClick={() => setActiveYear('2026')}
              className={`flex items-center gap-3 rounded-xl px-10 py-3.5 text-xs font-black tracking-widest transition-all ${activeYear === '2026'
                ? 'bg-background text-foreground shadow-xl border border-border'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              2026
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`flex items-center gap-3 rounded-xl px-10 py-3.5 text-xs font-black tracking-widest transition-all ${activeYear === '2025'
                ? 'bg-background text-foreground shadow-xl border border-border'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              2025
            </button>
          </div>

          <div className="flex items-center gap-4">
            <SpotifyConnect onMatchesFound={(ids) => {
              setSpotifyMatches(ids);
              setIsSpotifyConnected(true);
              if (ids.length > 0) setViewMode('spotify');
            }} />

            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-indigo-500/20 border-none transition-transform hover:scale-105 active:scale-95">
                  <Wand2 className="h-5 w-5" />
                  AI Scout
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-indigo-500/20 rounded-[3rem]">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase italic">The Scout</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium text-base">
                    Describe your perfect festival vibe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <Input
                    placeholder="e.g. late night hard techno rave..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="h-16 rounded-2xl border-border bg-muted/50 text-xl font-bold focus-visible:ring-indigo-500"
                  />
                  <Button 
                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-lg shadow-2xl"
                    onClick={handleAiScout}
                    disabled={isAiLoading || !aiPrompt.trim()}
                  >
                    {isAiLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : 'UNLEASH'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 -mx-4 space-y-6 bg-background/95 px-4 pb-8 pt-6 backdrop-blur-3xl md:top-16 border-b border-border/20">
        <div className="flex flex-col gap-6 lg:flex-row justify-between items-center max-w-7xl mx-auto w-full">
          <div className="inline-flex rounded-2xl bg-muted/50 p-1.5 border border-border/50 shadow-inner shrink-0 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setViewMode('discover')}
              className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-[10px] font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap ${viewMode === 'discover' ? 'bg-background text-foreground shadow-md border border-border' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Sparkles className="h-4 w-4" />
              Discover
            </button>
            <button
              onClick={() => setViewMode('az')}
              className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-[10px] font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap ${viewMode === 'az' ? 'bg-background text-foreground shadow-md border border-border' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <SortAsc className="h-4 w-4" />
              A-Z
            </button>
            <button
              onClick={() => setViewMode('by-day')}
              className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-[10px] font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap ${viewMode === 'by-day' ? 'bg-background text-foreground shadow-md border border-border' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Calendar className="h-4 w-4" />
              By Day
            </button>
            <button
              onClick={() => setViewMode('by-country')}
              className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-[10px] font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap ${viewMode === 'by-country' ? 'bg-background text-foreground shadow-md border border-border' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Globe className="h-4 w-4" />
              Country
            </button>
            {isSpotifyConnected && (
              <button
                onClick={() => setViewMode('spotify')}
                className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-[10px] font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap ${viewMode === 'spotify' ? 'bg-[#1DB954] text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
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

          <div className="flex flex-wrap gap-4 w-full lg:w-auto shrink-0 justify-end">
            <Select value={selectedVibe || 'all'} onValueChange={v => setSelectedVibe(v === 'all' ? null : v)}>
              <SelectTrigger className="h-14 w-full sm:w-[180px] text-[10px] font-black uppercase tracking-widest bg-muted/30 border-border/50 rounded-2xl transition-all hover:bg-muted/50">
                <SelectValue placeholder="ANY MOOD" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-popover shadow-2xl">
                <SelectItem value="all">ANY MOOD</SelectItem>
                {allVibeSet.map(vibe => (
                  <SelectItem key={vibe} value={vibe}>{vibe.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGenre || 'all'} onValueChange={v => setSelectedGenre(v === 'all' ? null : v)}>
              <SelectTrigger className="h-14 w-full sm:w-[180px] text-[10px] font-black uppercase tracking-widest bg-muted/30 border-border/50 rounded-2xl transition-all hover:bg-muted/50">
                <SelectValue placeholder="ANY GENRE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-popover shadow-2xl">
                <SelectItem value="all">ANY GENRE</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-16">
        {viewMode === 'ai' && aiResult && (
          <div className="space-y-16 mb-24">
            <div className="bg-indigo-600/5 border border-indigo-500/20 p-10 rounded-[3.5rem] relative overflow-hidden">
              <div className="absolute right-[-40px] top-[-40px] opacity-5 rotate-12">
                <Wand2 size={240} className="text-indigo-500" />
              </div>
              <div className="relative z-10 flex items-start gap-8">
                <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl">
                  <Wand2 className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-black uppercase italic text-foreground tracking-tighter">Scout Analysis</h2>
                  <p className="text-indigo-500 font-bold uppercase tracking-[0.2em] text-sm mt-2">Mood: "{aiPrompt}"</p>
                  <p className="mt-6 text-muted-foreground text-xl leading-relaxed max-w-3xl font-medium opacity-90">
                    {aiResult.scoutMessage}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {filteredArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'by-day' && (
          <div className="space-y-24">
            {DAY_ORDER.map(day => {
              const dayArtists = artistsByDay.grouped[day];
              if (!dayArtists || dayArtists.length === 0) return null;

              const headliners = dayArtists.filter(a => a.isHeadliner);
              const others = dayArtists.filter(a => !a.isHeadliner);

              return (
                <section key={day}>
                  <div className="flex items-center gap-8 mb-12">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground">{day}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-50">{dayArtists.length} items</span>
                  </div>

                  {headliners.length > 0 && (
                    <div className="mb-12">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                        {headliners.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </div>
                  )}

                  {others.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {others.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {(viewMode === 'discover' || viewMode === 'az' || viewMode === 'by-country' || viewMode === 'spotify') && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredArtists.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>

      {filteredArtists.length === 0 && (
        <div className="py-40 text-center bg-muted/30 rounded-[4rem] border border-dashed border-border/50 max-w-4xl mx-auto">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-muted shadow-inner opacity-40">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-4xl font-black uppercase italic text-foreground tracking-tighter">Zero Matches</h3>
          <p className="mt-6 text-muted-foreground text-xl font-medium max-w-sm mx-auto opacity-70 leading-relaxed">
            Your filters are too strict. Loosen up to find the magic.
          </p>
          <Button
            variant="outline"
            className="mt-12 rounded-[1.5rem] px-12 h-16 font-black uppercase tracking-[0.2em] border-border text-sm hover:bg-muted shadow-2xl"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedVibe(null);
              setViewMode('discover');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
