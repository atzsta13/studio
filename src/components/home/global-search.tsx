'use client';
import { BASE_PATH } from '@/lib/base-path';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { FESTIVAL_IDS, getFestivalConfig } from '@/config/festival-engine';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { LineupItem } from '@/types';

interface GlobalResult {
  festivalId: string;
  festivalName: string;
  artist: LineupItem;
}

import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const router = useRouter();
  const [query, setSearchQuery] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
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
          } catch {
            console.error(`Failed to load lineup for ${id}`);
          }
        })
      );
      setAllLineups(results);
      setIsLoading(false);
    }
    fetchAll();
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const matches: GlobalResult[] = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(allLineups).forEach(([festId, artists]) => {
      const config = getFestivalConfig(festId);
      artists.forEach(artist => {
        if (
          artist.artist.toLowerCase().includes(lowerQuery) ||
          artist.genres?.some(g => g.toLowerCase().includes(lowerQuery))
        ) {
          matches.push({
            festivalId: festId,
            festivalName: config.name,
            artist
          });
        }
      });
    });

    return matches.slice(0, 8); // Top 8 results
  }, [query, allLineups]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl group-focus-within:bg-primary/40 transition-all duration-500 opacity-0 group-focus-within:opacity-100" />
        <div className="relative flex items-center">
          <Search className="absolute left-6 h-6 w-6 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search 4 festivals and 800+ artists..."
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-20 pl-16 pr-8 rounded-[2rem] bg-card/50 border-white/5 text-xl font-bold focus-visible:ring-primary/50 backdrop-blur-3xl transition-all"
          />
          {isLoading && <Loader2 className="absolute right-6 h-6 w-6 animate-spin text-primary/40" />}
        </div>
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-4 w-full bg-card/90 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden z-50 p-4"
          >
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Link 
                  key={`${result.festivalId}-${result.artist.id}`} 
                  href={`/${result.festivalId}/artist/${result.artist.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted border border-white/5">
                      {result.artist.imageUrl && (
                        <img src={result.artist.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-black uppercase italic tracking-tighter text-lg leading-none mb-1 group-hover:text-primary transition-colors">
                        {result.artist.artist}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <MapPin size={10} className="text-primary" />
                        {result.festivalName}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
