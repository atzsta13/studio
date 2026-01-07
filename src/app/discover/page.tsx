'use client';

import { useState, useMemo } from 'react';
import type { LineupItem } from '@/types';
import lineup from '@/data/lineup.json';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Music, Search } from 'lucide-react';
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

const allArtists = lineup as LineupItem[];

const getFlagEmoji = (countryCode: string | undefined) => {
  if (!countryCode || countryCode === 'Unknown') return '';
  const trimmedCode = countryCode.trim().toUpperCase();
  const code = trimmedCode === 'UK' ? 'GB' : trimmedCode;
  const codePoints = code
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState('popularity');

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    allArtists.forEach(item => item.genres?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, []);

  const filteredArtists = useMemo(() => {
    return allArtists.filter(artist => {
      const matchesSearch =
        artist.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres?.some(g =>
          g.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesGenre =
        !selectedGenre || artist.genres?.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    }).sort((a, b) => {
      switch (sortOrder) {
        case 'az':
          return a.artist.localeCompare(b.artist);
        case 'za':
          return b.artist.localeCompare(a.artist);
        case 'country':
          const countryA = a.countryCode || '';
          const countryB = b.countryCode || '';
          if (countryA !== countryB) return countryA.localeCompare(countryB);
          return a.artist.localeCompare(b.artist);
        case 'popularity':
        default:
          return Number(a.id) - Number(b.id);
      }
    });
  }, [searchTerm, selectedGenre, sortOrder]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Browse Artists
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore the full lineup of Sziget 2026.
        </p>
      </header>

      <div className="sticky top-0 md:top-16 z-20 -mx-4 bg-background/95 px-4 py-4 backdrop-blur-md border-b">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by artist or genre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity (ID)</SelectItem>
              <SelectItem value="az">A - Z</SelectItem>
              <SelectItem value="za">Z - A</SelectItem>
              <SelectItem value="country">By Country</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          {/* Gradient indicators for scrolling */}
          <div className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />

          <div className="flex overflow-x-auto gap-2 py-1 px-4 no-scrollbar items-center">
            <Button
              variant={!selectedGenre ? 'default' : 'outline'}
              onClick={() => setSelectedGenre(null)}
              size="sm"
              className="flex-shrink-0"
            >
              All Genres
            </Button>
            {allGenres.map(genre => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(genre)}
                size="sm"
                className="flex-shrink-0"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArtists.length > 0 ? (
          filteredArtists.map(artist => (
            <Card key={artist.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-xl hover:border-primary">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.artist}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Music className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex-shrink-0" suppressHydrationWarning>{getFlagEmoji(artist.countryCode)}</span>
                  <span className="truncate">{artist.artist}</span>
                </CardTitle>
                <CardDescription>
                  {artist.day} &bull; {artist.stage}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="mb-4 flex flex-wrap gap-2">
                  {artist.genres?.slice(0, 3).map(genre => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <Button asChild size="sm" className="mt-auto w-full">
                  <Link href={`/artist/${artist.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <p className="font-bold">No artists found!</p>
            <p className="text-sm">
              Try changing your search term or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
