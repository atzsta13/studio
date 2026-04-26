'use client';

import { useLineupDiff } from '@/hooks/use-lineup-diff';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Music,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import type { LineupItem } from '@/types';

export function LineupDiff({ festivalId, lineup }: { festivalId: string, lineup: LineupItem[] }) {
  const { newArrivals, returningHeroes, genreShifts, isLoading } = useLineupDiff(festivalId, lineup);

  if (isLoading || (newArrivals.length === 0 && returningHeroes.length === 0)) return null;

  return (
    <div className="mt-20">
      <div className="flex items-center gap-6 mb-12">
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">What's New</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase tracking-widest px-4 py-2 rounded-full">
          2025 → 2026
        </Badge>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-[2rem] bg-muted/20 p-2 h-16 border border-white/5 backdrop-blur-3xl mb-12">
          <TabsTrigger value="new" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em]">New Arrivals</TabsTrigger>
          <TabsTrigger value="returning" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em]">Returning</TabsTrigger>
          <TabsTrigger value="shifts" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em]">Vibe Shift</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {newArrivals.slice(0, 12).map(artist => (
              <Link key={artist.id} href={`/${festivalId}/artist/${artist.id}`} className="group">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-muted relative border border-white/5 shadow-2xl">
                  {artist.imageUrl && (
                    <img src={artist.imageUrl} alt={artist.artist} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-black uppercase italic text-white text-[10px] tracking-tight leading-none truncate">{artist.artist}</p>
                    <div className="mt-2 flex gap-1">
                      <span className="bg-primary text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">NEW</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link href={`/${festivalId}/discover`} className="group">
              <div className="aspect-[4/5] rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center p-6 text-center hover:border-primary/40 transition-all">
                <UserPlus size={32} className="text-primary mb-4" />
                <p className="font-black uppercase italic text-[10px] tracking-widest text-muted-foreground group-hover:text-primary">See all {newArrivals.length} newcomers</p>
              </div>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="returning">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {returningHeroes.slice(0, 11).map(artist => (
              <Link key={artist.id} href={`/${festivalId}/artist/${artist.id}`} className="group">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-muted relative border border-white/5">
                  {artist.imageUrl && (
                    <img src={artist.imageUrl} alt={artist.artist} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-black uppercase italic text-white text-[10px] tracking-tight leading-none truncate">{artist.artist}</p>
                    <div className="mt-2 flex gap-1">
                      <span className="bg-white/10 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">RETURNING</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shifts">
          <Card className="bg-card/50 border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl">
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                    <TrendingUp className="text-primary" /> Rising Sounds
                  </h3>
                  <div className="space-y-4">
                    {genreShifts.filter(s => s.diff > 0).slice(0, 5).map(s => (
                      <div key={s.genre} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <span className="font-black uppercase italic tracking-tight">{s.genre}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-muted-foreground">{s.current} acts</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none">+{s.diff}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                    <TrendingDown className="text-muted-foreground" /> Evolving DNA
                  </h3>
                  <div className="space-y-4">
                    {genreShifts.filter(s => s.diff < 0).slice(0, 5).map(s => (
                      <div key={s.genre} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-60">
                        <span className="font-black uppercase italic tracking-tight">{s.genre}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-muted-foreground">{s.current} acts</span>
                          <Badge variant="outline" className="border-red-500/30 text-red-400">-{Math.abs(s.diff)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
