'use client';

import { useState, useMemo } from 'react';
import type { LineupItem } from '@/types';
import lineup from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Music, Search, History } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
})) as (LineupItem & { vibes: string[] })[];

const allArtists2025 = (lineup2025 as any[]).map(a => ({
  ...a,
  vibes: a.vibes || [],
})) as (LineupItem & { vibes: string[] })[];

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

export default function DiscoverPage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState('popularity');

  const allArtists = useMemo(() => {
    return activeYear === '2026' ? allArtists2026 : allArtists2025;
  }, [activeYear]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    allArtists.forEach(item => item.genres?.forEach(g => {
      if (g !== 'MUSIC') genres.add(g);
    }));
    return Array.from(genres).sort();
  }, []);

  const allVibeSet = useMemo(() => {
    const vibes = new Set<string>();
    allArtists.forEach(item => item.vibes?.forEach(v => vibes.add(v)));
    return Array.from(vibes).sort();
  }, []);

  const filteredArtists = useMemo(() => {
    return allArtists.filter(artist => {
      const matchesSearch =
        artist.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres?.some(g =>
          g.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        artist.vibes?.some(v =>
          v.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesGenre =
        !selectedGenre || artist.genres?.includes(selectedGenre);
      const matchesVibe =
        !selectedVibe || artist.vibes?.includes(selectedVibe);
      return matchesSearch && matchesGenre && matchesVibe;
    }).sort((a, b) => {
      switch (sortOrder) {
        case 'az':
          return a.artist.localeCompare(b.artist);
        case 'za':
          return b.artist.localeCompare(a.artist);
        case 'stage':
          return a.stage.localeCompare(b.stage);
        case 'popularity':
        default:
          return Number(a.id) - Number(b.id);
      }
    });
  }, [searchTerm, selectedGenre, selectedVibe, sortOrder]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Music Finder
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Don't just see the headliners. Discover your new favorite artists by mood, genre, and vibe.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-xl bg-muted/50 p-1 border border-border/50 shadow-inner">
            <button
              onClick={() => setActiveYear('2026')}
              className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold transition-all ${activeYear === '2026'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              2026 Season
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold transition-all ${activeYear === '2025'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <History className="h-4 w-4" />
              2025 Legend
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 -mx-4 space-y-4 bg-background/95 px-4 pb-6 pt-4 backdrop-blur-md md:top-16 border-b shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by artist, genre, or vibe (e.g. 'moshpit')..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-12 pl-10 text-lg shadow-sm"
            />
          </div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-12 w-full sm:w-[200px] shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity (Headliners First)</SelectItem>
              <SelectItem value="az">A - Z</SelectItem>
              <SelectItem value="za">Z - A</SelectItem>
              <SelectItem value="stage">By Stage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Filter by Mood</span>
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            <Button
              variant={!selectedVibe ? 'default' : 'secondary'}
              onClick={() => setSelectedVibe(null)}
              size="sm"
              className="flex-shrink-0"
            >
              Any Mood
            </Button>
            {allVibeSet.map(vibe => (
              <Button
                key={vibe}
                variant={selectedVibe === vibe ? 'default' : 'secondary'}
                onClick={() => setSelectedVibe(vibe)}
                size="sm"
                className="flex-shrink-0 gap-2"
              >
                {vibe}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Filter by Genre</span>
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
            <Button
              variant={!selectedGenre ? 'default' : 'outline'}
              onClick={() => setSelectedGenre(null)}
              size="sm"
              className="flex-shrink-0 rounded-full h-8 px-4"
            >
              All Genres
            </Button>
            {allGenres.map(genre => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(genre)}
                size="sm"
                className="flex-shrink-0 rounded-full h-8 px-4"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold">
          {filteredArtists.length} {filteredArtists.length === 1 ? 'Artist' : 'Artists'} Found
        </h2>
        {(selectedGenre || selectedVibe || searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedVibe(null);
              setSearchTerm('');
            }}
            className="text-primary hover:text-primary/80"
          >
            Clear all filters
          </Button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredArtists.length > 0 ? (
          filteredArtists.map(artist => (
            <Card key={artist.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-2xl hover:border-primary/50 bg-card border-border/50">
              <Link href={`/artist/${artist.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.artist}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/50">
                    <Music className="h-12 w-12 text-muted-foreground/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-xs font-medium text-white/80 line-clamp-2">
                    {artist.description?.substring(0, 100)}...
                  </p>
                </div>
                {artist.stage === 'Main Stage' && (
                  <div className="absolute top-2 left-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black shadow-lg">
                    Headliner
                  </div>
                )}
              </Link>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors pr-2">
                    <span className="flex-shrink-0 text-xl" suppressHydrationWarning>{getFlagEmoji(artist.countryCode)}</span>
                    <span className="truncate text-lg leading-tight">{artist.artist}</span>
                  </CardTitle>
                </div>
                <CardDescription className="flex flex-col gap-0.5 mt-1 font-medium">
                  <span className="text-foreground/80">{artist.day} &bull; {artist.stage}</span>
                  <span className="text-muted-foreground text-xs">{artist.vibes?.join(' &bull; ')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between pt-0">
                <div className="mb-4 flex flex-wrap gap-1.5 mt-2">
                  {artist.genres?.filter(g => g !== 'MUSIC').slice(0, 3).map(genre => (
                    <Badge key={genre} variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/5 text-primary-foreground border-primary/10">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <Button asChild size="sm" variant="outline" className="mt-auto w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl">
                  <Link href={`/artist/${artist.id}`}>
                    Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Search className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No artists found</h3>
            <p className="mt-2 text-muted-foreground">
              We couldn't find any artists that match your current mood or search term.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSelectedGenre(null);
                setSelectedVibe(null);
                setSearchTerm('');
              }}
            >
              Reset all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
