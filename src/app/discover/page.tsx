'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Wand2, Loader2, Music } from 'lucide-react';
import {
  recommendArtists,
  type RecommendArtistsOutput,
} from '@/ai/flows/recommend-artists-flow';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import Link from 'next/link';

const allArtists: LineupItem[] = lineup as LineupItem[];

export default function DiscoverPage() {
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] =
    useState<RecommendArtistsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const result = await recommendArtists({ prompt });
      setRecommendations(result);
    } catch (err) {
      console.error(err);
      setError('Sorry, the AI curator is taking a break. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getArtistByName = (name: string) => {
    return allArtists.find(a => a.artist.toLowerCase() === name.toLowerCase());
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 inline-block rounded-full bg-primary/20 p-4">
          <Wand2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Discover Your Vibe
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell our AI curator what you're in the mood for, and get personalized
          artist recommendations from the lineup.
        </p>
      </header>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., 'High-energy electronic music to dance to' or 'Chill indie bands for a sunny afternoon'"
              className="mb-4 min-h-[80px]"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Curating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Find Artists
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      )}

      {recommendations && (
        <div>
          <h2 className="mb-4 text-center text-2xl font-bold">
            Here's Your Vibe...
          </h2>
          <div className="space-y-4">
            {recommendations.recommendations.map(rec => {
              const artistDetails = getArtistByName(rec.artist);
              return (
                <Card key={rec.artist} className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Music /> {rec.artist}
                    </CardTitle>
                     {artistDetails && (
                      <CardDescription>
                        {artistDetails.day} &bull; {artistDetails.stage}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-muted-foreground">{rec.reasoning}</p>
                     {artistDetails && (
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link href={`/schedule?artist=${artistDetails.id}`}>
                          View on Schedule
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
