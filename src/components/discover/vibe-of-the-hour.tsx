'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FESTIVAL } from '@/config/festival';
import type { LineupItem } from '@/types';

export function VibeOfTheHour({ artists }: { artists: LineupItem[] }) {
  const currentArtist = useMemo(() => {
    // Deterministic selection based on hour
    const hour = new Date().getHours();
    const index = hour % artists.length;
    return artists[index];
  }, [artists]);

  if (!currentArtist) return null;

  return (
    <Card className="mb-20 bg-primary border-none shadow-2xl rounded-[3rem] overflow-hidden group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Link href={`/artist/${currentArtist.id}`} className="block">
        <div className="flex flex-col md:flex-row items-center relative min-h-[250px]">
           <div className="absolute right-[-40px] top-[-40px] opacity-20 group-hover:rotate-12 transition-transform duration-1000">
             <Zap size={300} className="text-white" />
           </div>
           
           <div className="w-full md:w-1/3 h-[250px] relative overflow-hidden shrink-0">
             <img 
               src={currentArtist.imageUrl} 
               alt={currentArtist.artist} 
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/100 hidden md:block" />
             <div className="absolute inset-0 bg-gradient-to-t from-primary/100 via-primary/20 to-transparent md:hidden" />
           </div>

           <div className="p-10 flex-1 relative z-10 text-white">
             <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-white/20 text-white font-black italic tracking-widest text-[10px] uppercase py-1 px-4 rounded-full border border-white/20">
                  <Clock className="mr-2 h-3 w-3" /> Vibe of the Hour
                </Badge>
             </div>
             
             <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4 transition-all group-hover:translate-x-4">
               {currentArtist.artist}
             </h2>
             
             <p className="text-lg md:text-xl font-medium opacity-90 max-w-xl italic mb-8 leading-snug">
               "{currentArtist.description?.substring(0, 100)}..."
             </p>

             <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em]">
                Explore Set <ArrowRight className="h-4 w-4" />
             </div>
           </div>
        </div>
      </Link>
    </Card>
  );
}
