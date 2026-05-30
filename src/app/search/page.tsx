import { BASE_PATH } from '@/lib/base-path';
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, Music2, MapPin, Calendar, ArrowRight, Loader2, Filter } from 'lucide-react';
import { FESTIVAL_IDS, getFestivalConfig } from '@/config/festival-engine';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LineupItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface GlobalArtistMatch {
  artistName: string;
  festivals: Array<{
    id: string;
    artistId: string;
    name: string;
    day: string | null;
    stage: string | null;
    startTime: string | null;
    imageUrl: string | null;
  }>;
}

function HubSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [allLineups, setAllLineups] = useState<Record<string, LineupItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const results: Record<string, LineupItem[]> = {};
      await Promise.all(
        FESTIVAL_IDS.map(async (id) => {
          try {
            const res = await fetch(`${BASE_PATH}/data/${id}/lineup.json`);
            if (res.ok) results[id] = await res.json();
          } catch (e) {
            console.error(`Failed to load lineup for ${id}`);
          }
        })
      );
      setAllLineups(results);
      setIsLoading(false);
    }
    fetchAll();
  }, []);

  const aggregatedResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const artistMap = new Map<string, GlobalArtistMatch>();
    const lowerQuery = query.toLowerCase();

    Object.entries(allLineups).forEach(([festId, artists]) => {
      const config = getFestivalConfig(festId);
      artists.forEach(artist => {
        if (
          artist.artist.toLowerCase().includes(lowerQuery) ||
          artist.genres?.some(g => g.toLowerCase().includes(lowerQuery))
        ) {
          const existing = artistMap.get(artist.artist.toLowerCase());
          const festInfo = {
            id: festId,
            artistId: artist.id,
            name: config.name,
            day: artist.day ?? null,
            stage: artist.stage ?? null,
            startTime: artist.startTime ?? null,
            imageUrl: artist.imageUrl ?? null
          };

          if (existing) {
            existing.festivals.push(festInfo);
          } else {
            artistMap.set(artist.artist.toLowerCase(), {
              artistName: artist.artist,
              festivals: [festInfo]
            });
          }
        }
      });
    });

    return Array.from(artistMap.values());
  }, [query, allLineups]);

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-8 hover:opacity-70 transition-opacity">
            ← Back to Hub
          </Link>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8">
            Global <span className="text-primary text-glow">Search</span>
          </h1>
          <div className="relative group max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artist across 4 festivals..."
              className="h-20 pl-16 pr-8 rounded-[2rem] bg-card/50 border-white/5 text-xl font-bold focus-visible:ring-primary/50 backdrop-blur-3xl transition-all"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing All Lineups...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {aggregatedResults.length > 0 ? (
              aggregatedResults.map((match, i) => (
                <motion.div
                  key={match.artistName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-8 mb-6">
                    <div className="h-24 w-24 rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-2xl">
                      <img src={match.festivals[0].imageUrl || ''} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">{match.artistName}</h2>
                      <p className="text-primary font-black uppercase text-[10px] tracking-[0.4em] mt-2">Appears at {match.festivals.length} Festivals</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {match.festivals.map(fest => (
                      <Link key={fest.id} href={`/${fest.id}/artist/${fest.artistId}`}>
                        <Card className="group bg-card/30 border-white/5 hover:border-primary/30 transition-all rounded-[2rem] overflow-hidden cursor-pointer hover:scale-[1.02]">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary"><MapPin size={14} /></div>
                              <ArrowRight size={16} className="text-white/10 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{fest.name}</p>
                              <p className="text-lg font-black uppercase italic tracking-tighter mt-1">{fest.day || 'TBD'}</p>
                              <p className="text-xs font-bold text-primary/60 mt-1">{fest.stage || 'TBA'}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : query.length > 1 ? (
              <div className="text-center py-20 bg-card/20 rounded-[3.5rem] border border-dashed border-white/10">
                <Music2 size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">No Artists Found</h3>
                <p className="text-muted-foreground font-medium italic mt-2">Try searching for a different vibe or genre.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale pointer-events-none">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-40 rounded-[2rem] bg-card border border-white/5 border-dashed" />
                 ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HubSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <HubSearchContent />
    </Suspense>
  );
}
