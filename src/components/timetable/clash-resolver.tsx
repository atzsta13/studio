'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap } from 'lucide-react';
import type { LineupItem } from '@/types';
import { useClashResolver } from '@/hooks/use-clash-resolver';

export function ClashResolver({ favorites }: { favorites: LineupItem[] }) {
  const clashes = useClashResolver(favorites);

  if (clashes.length === 0) return null;

  return (
    <Card className="bg-orange-600/10 border-orange-500/20 shadow-2xl overflow-hidden rounded-[3rem] mb-12 backdrop-blur-3xl">
      <CardHeader className="bg-orange-500/10 border-b border-orange-500/10 px-10 py-8 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-4 text-orange-500 text-2xl font-black uppercase italic tracking-tighter">
          <AlertTriangle size={32} />
          Clash Resolver
        </CardTitle>
        <Badge className="bg-orange-500 text-black font-black italic px-4 py-1 rounded-full uppercase text-[10px]">
          {clashes.length} Detected
        </Badge>
      </CardHeader>
      <CardContent className="p-10">
        <div className="space-y-6">
          {clashes.slice(0, 3).map((clash, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] bg-black/20 border border-white/5 shadow-inner group">
               <div className="flex-1 text-center md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{clash.a.stage}</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter text-foreground">{clash.a.artist}</p>
               </div>
               <div className="p-4 rounded-full bg-orange-500/20 text-orange-500 animate-pulse">
                  <Zap size={24} />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{clash.b.stage}</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter text-foreground">{clash.b.artist}</p>
               </div>
            </div>
          ))}
          {clashes.length > 3 && (
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/60 pt-4">
              + {clashes.length - 3} more critical overlaps detected
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
