'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music2, ExternalLink } from 'lucide-react';

export function SetlistLinks({ artistName }: { artistName: string }) {
  const setlistUrl = `https://www.setlist.fm/search?query=${encodeURIComponent(artistName)}`;

  return (
    <Card className="bg-emerald-600/10 border-emerald-500/20 shadow-2xl overflow-hidden rounded-[3rem] backdrop-blur-3xl mt-8">
      <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/10 px-10 py-6">
        <CardTitle className="flex items-center gap-4 text-emerald-400 text-xl font-black uppercase italic tracking-tighter">
          <Music2 size={24} />
          Expected Setlist
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <p className="text-sm font-medium text-muted-foreground italic mb-6 opacity-80 leading-snug">
          Curious about the vibes? Scout the most recent setlists for {artistName} before the show.
        </p>
        <Button asChild className="w-full h-14 rounded-[1.2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-3">
          <a href={setlistUrl} target="_blank" rel="noopener noreferrer">
             View on Setlist.fm <ExternalLink size={14} />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
