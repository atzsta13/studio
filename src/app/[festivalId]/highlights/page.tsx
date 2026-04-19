'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Trophy, Music, Globe, Share2, Sparkles, Loader2 } from 'lucide-react';
import { getFestivalConfig } from '@/config/festival-engine';
import { useFestivalData } from '@/hooks/use-festival-data';
import type { LineupItem } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type FavoriteTier = 'must_see' | 'interested';

export default function HighlightsPage() {
  const { festivalId } = useParams() as { festivalId: string };
  const { config, lineup, isLoading } = useFestivalData(festivalId);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [tieredFavorites, setTieredFavorites] = useState<Record<string, FavoriteTier>>({});

  useEffect(() => {
    setIsMounted(true);
    try {
      const key = `${festivalId}-favorites-v2`;
      const raw = localStorage.getItem(key);
      if (raw) {
        setTieredFavorites(JSON.parse(raw) as Record<string, FavoriteTier>);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [festivalId]);

  const favoriteArtists = useMemo<LineupItem[]>(() => {
    if (!lineup.length || !Object.keys(tieredFavorites).length) return [];
    return (lineup as LineupItem[]).filter((a) => a.id in tieredFavorites);
  }, [lineup, tieredFavorites]);

  const mustSeeArtists = useMemo<LineupItem[]>(() => {
    return favoriteArtists.filter((a) => tieredFavorites[a.id] === 'must_see');
  }, [favoriteArtists, tieredFavorites]);

  const interestedArtists = useMemo<LineupItem[]>(() => {
    return favoriteArtists.filter((a) => tieredFavorites[a.id] === 'interested');
  }, [favoriteArtists, tieredFavorites]);

  const genreCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    favoriteArtists.forEach((a) => {
      (a.genres ?? []).forEach((g) => {
        if (g !== 'MUSIC') {
          counts[g] = (counts[g] ?? 0) + 1;
        }
      });
    });
    return counts;
  }, [favoriteArtists]);

  const topGenres = useMemo<Array<{ genre: string; count: number }>>(() => {
    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [genreCounts]);

  const festivalDna = useMemo<string>(() => {
    return topGenres
      .slice(0, 3)
      .map((g) => g.genre.toUpperCase())
      .join(' · ');
  }, [topGenres]);

  const countryCount = useMemo<number>(() => {
    const countries = new Set<string>();
    favoriteArtists.forEach((a) => {
      if (a.countryCode && a.countryCode !== 'Unknown') {
        countries.add(a.countryCode.trim().toUpperCase());
      }
    });
    return countries.size;
  }, [favoriteArtists]);

  const maxGenreCount = useMemo<number>(() => {
    return topGenres.length > 0 ? topGenres[0].count : 1;
  }, [topGenres]);

  const handleShare = async () => {
    const mustSeeNames = mustSeeArtists.map((a) => a.artist).slice(0, 5).join(', ');
    const shareText = [
      `🎪 My ${config.name} Festival Wrap`,
      ``,
      `⭐ ${favoriteArtists.length} artists favorited`,
      `🔥 Must-see: ${mustSeeNames || 'TBD'}`,
      festivalDna ? `🎵 Festival DNA: ${festivalDna}` : '',
      `🌍 ${countryCount} countries represented`,
      ``,
      `Built with ${config.appName}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: `My ${config.name} Highlights`, text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'COPIED TO CLIPBOARD', description: 'Share your festival wrap!' });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'COPIED TO CLIPBOARD', description: 'Share your festival wrap!' });
      } catch {
        // ignore
      }
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state
  if (favoriteArtists.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[3.5rem] bg-primary/5 border border-primary/10 shadow-2xl">
          <Star className="h-14 w-14 text-primary opacity-60" />
        </div>
        <h1 className="text-6xl font-black uppercase italic tracking-tighter text-foreground leading-[0.85] mb-6">
          No Favorites<br />
          <span className="text-primary">Yet</span>
        </h1>
        <p className="text-muted-foreground text-xl font-medium max-w-sm mx-auto leading-relaxed opacity-70 italic mb-12">
          Start building your lineup. Save artists as must-see or interested to generate your personal wrap.
        </p>
        <Link
          href={`/${festivalId}/discover`}
          className="inline-flex items-center justify-center gap-4 rounded-[1.5rem] h-18 px-12 py-5 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.25em] text-sm shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-5 w-5" />
          Explore Artists
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 pb-32">
      <div className="container mx-auto max-w-3xl">

        {/* ── Header ── */}
        <header className="text-center mb-16 relative">
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 opacity-5 blur-[120px] bg-primary w-96 h-96 rounded-full pointer-events-none" />
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/5 border border-primary/10 shadow-2xl ring-1 ring-primary/20">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-black text-7xl sm:text-9xl uppercase italic tracking-tighter leading-[0.8] text-foreground mb-4">
            My <span className="text-primary text-glow">Wrap</span>
          </h1>
          <p className="text-muted-foreground text-xl font-medium opacity-60 italic">
            {config.name} · Personal Highlights
          </p>
        </header>

        {/* ── Festival DNA ── */}
        {festivalDna && (
          <section className="mb-8">
            <div className="bg-primary/5 border border-primary/15 rounded-[3.5rem] p-10 text-center relative overflow-hidden shadow-2xl shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 mb-5 relative z-10">
                Your Festival DNA
              </p>
              <h2 className="font-black text-3xl sm:text-5xl uppercase italic tracking-tighter text-primary leading-tight relative z-10 text-glow">
                {festivalDna}
              </h2>
            </div>
          </section>
        )}

        {/* ── Stats Row ── */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          {/* Total Favorites */}
          <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <span className="font-black text-4xl sm:text-5xl text-foreground leading-none">
              {favoriteArtists.length}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 leading-tight">
              Artists Saved
            </span>
          </div>

          {/* Countries */}
          <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-secondary/10">
              <Globe className="h-6 w-6 text-secondary" />
            </div>
            <span className="font-black text-4xl sm:text-5xl text-foreground leading-none">
              {countryCount}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 leading-tight">
              Countries
            </span>
          </div>

          {/* Must See Count */}
          <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-accent/10">
              <Music className="h-6 w-6 text-accent" />
            </div>
            <span className="font-black text-4xl sm:text-5xl text-foreground leading-none">
              {mustSeeArtists.length}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 leading-tight">
              Must-See
            </span>
          </div>
        </section>

        {/* ── Tier Split ── */}
        <section className="mb-8">
          <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-8 sm:p-10 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-6">
              Tier Breakdown
            </p>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80">
                    ⭐ Must-See
                  </span>
                  <span className="font-black text-2xl text-primary">{mustSeeArtists.length}</span>
                </div>
                <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{
                      width: favoriteArtists.length > 0
                        ? `${(mustSeeArtists.length / favoriteArtists.length) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80">
                    🔖 Interested
                  </span>
                  <span className="font-black text-2xl text-secondary">{interestedArtists.length}</span>
                </div>
                <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-700"
                    style={{
                      width: favoriteArtists.length > 0
                        ? `${(interestedArtists.length / favoriteArtists.length) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Genre Breakdown ── */}
        {topGenres.length > 0 && (
          <section className="mb-8">
            <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-8 sm:p-10 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-8">
                Top Genres
              </p>
              <div className="space-y-4">
                {topGenres.map(({ genre, count }) => (
                  <div key={genre} className="flex items-center gap-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground w-28 shrink-0 truncate">
                      {genre}
                    </span>
                    <div className="flex-1 h-8 bg-muted/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
                        style={{ width: `${(count / maxGenreCount) * 100}%` }}
                      />
                    </div>
                    <span className="font-black text-base text-primary w-6 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Must-See List ── */}
        {mustSeeArtists.length > 0 && (
          <section className="mb-8">
            <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-8 sm:p-10 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-8">
                Must-See Picks
              </p>
              <ol className="space-y-4">
                {mustSeeArtists.map((artist, idx) => (
                  <li key={artist.id}>
                    <Link
                      href={`/${festivalId}/artist/${artist.id}`}
                      className="flex items-center gap-5 group rounded-[2rem] px-4 py-3 -mx-4 hover:bg-primary/5 transition-colors duration-300"
                    >
                      <span className="font-black text-5xl text-foreground/10 tabular-nums w-10 text-center shrink-0 group-hover:text-primary/30 transition-colors">
                        {idx + 1}
                      </span>
                      {artist.imageUrl && (
                        <div className="h-14 w-14 rounded-[1.25rem] overflow-hidden shrink-0 shadow-lg">
                          <img
                            src={artist.imageUrl}
                            alt={artist.artist}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black uppercase italic tracking-tight text-xl text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                          {artist.artist}
                        </p>
                        {(artist.genres ?? []).filter((g) => g !== 'MUSIC').length > 0 && (
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mt-1 truncate">
                            {(artist.genres ?? []).filter((g) => g !== 'MUSIC').slice(0, 2).join(' · ')}
                          </p>
                        )}
                      </div>
                      <Star className="h-5 w-5 text-primary shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ── Interested list (collapsed preview) ── */}
        {interestedArtists.length > 0 && (
          <section className="mb-8">
            <div className="bg-card/50 border border-white/5 rounded-[3.5rem] p-8 sm:p-10 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-6">
                On Your Radar
              </p>
              <div className="flex flex-wrap gap-3">
                {interestedArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/${festivalId}/artist/${artist.id}`}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-secondary/5 border border-secondary/15 text-[11px] font-black uppercase tracking-[0.15em] text-secondary hover:bg-secondary/10 hover:border-secondary/30 transition-all duration-300"
                  >
                    {artist.artist}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Share CTA ── */}
        <section className="mt-12">
          <Button
            onClick={handleShare}
            className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-base shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-4"
          >
            <Share2 className="h-6 w-6" />
            Share Your Wrap
          </Button>

          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-8">
            <Link
              href={`/${festivalId}/discover`}
              className="hover:text-primary transition-colors duration-300"
            >
              ← Back to Discovery
            </Link>
          </p>
        </section>

      </div>
    </div>
  );
}
