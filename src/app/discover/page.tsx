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
import { Music, Search, Tag, User, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const allArtists = lineup as LineupItem[];

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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
    });
  }, [searchTerm, selectedGenre]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 inline-block rounded-full bg-primary/20 p-4">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Browse Artists
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore the full lineup of Sziget 2026.
        </p>
      </header>

      <div className="sticky top-16 z-20 bg-background/95 py-4 backdrop-blur-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by artist or genre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
            <Button 
                variant={!selectedGenre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(null)}
                size="sm"
            >
                All Genres
            </Button>
          {allGenres.map(genre => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              onClick={() => setSelectedGenre(genre)}
              size="sm"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArtists.length > 0 ? (
          filteredArtists.map(artist => (
            <Card key={artist.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  {artist.artist}
                </CardTitle>
                <CardDescription>
                  {artist.day} &bull; {artist.stage}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-3 flex flex-wrap gap-2">
                  {artist.genres?.map(genre => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href={`/schedule?artist=${artist.id}`}>
                    View on Schedule
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
